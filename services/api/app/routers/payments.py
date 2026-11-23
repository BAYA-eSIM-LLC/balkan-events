"""Stripe payment system (TEST MODE only).
Checkout Sessions, verified webhooks, refunds, ledger entries, emails.
Never trusts frontend redirect or URL parameters. All financial actions are idempotent.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import stripe
import secrets
from app.database import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.models.payment import Payment, Refund, StripeEvent, PaymentStatus
from app.models.ticket import Ticket, TicketType
from app.models.inventory import TicketInventory
from app.models.ledger import LedgerEntry
from app.models.user import User, UserRole
from app.models.event import Event
from app.models.organization import OrganizationMember
from app.deps import get_current_user, require_role
from app.config import (
    STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_SUCCESS_URL,
    STRIPE_CANCEL_URL, PLATFORM_FEE_PERCENT
)
from app.routers.admin_system import log_audit
from app.services.email import queue_email, payment_success_body, payment_failed_body, refund_body

router = APIRouter(prefix="/payments", tags=["payments"])

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

class CheckoutOut(BaseModel):
    session_id: str
    url: str
    order_id: int

class RefundIn(BaseModel):
    payment_id: int
    amount: Optional[float] = None
    reason: Optional[str] = None

async def _issue_tickets_for_order(db: AsyncSession, order: Order) -> list[str]:
    """Issue QR tickets exactly once. Called only from verified webhook."""
    codes = []
    if order.status != OrderStatus.RESERVED.value:
        return codes
    items = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
    for oi in items.scalars():
        inv = await db.execute(
            select(TicketInventory).where(TicketInventory.ticket_type_id == oi.ticket_type_id).with_for_update()
        )
        inventory = inv.scalar_one_or_none()
        if not inventory or inventory.reserved < oi.quantity:
            order.status = "payment_late"
            await db.commit()
            return codes
        inventory.reserved -= oi.quantity
        inventory.sold += oi.quantity
        for _ in range(oi.quantity):
            code = secrets.token_urlsafe(16)
            ticket = Ticket(
                ticket_type_id=oi.ticket_type_id,
                order_item_id=oi.id,
                code=code,
                qr_data=f"BE:{code}:{order.id}",
                is_used=False,
            )
            db.add(ticket)
            codes.append(ticket.qr_data)
    order.status = OrderStatus.PAID.value
    await db.commit()
    return codes

@router.post("/checkout/{order_id}", response_model=CheckoutOut)
async def create_checkout_session(
    order_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(503, "Stripe not configured (TEST MODE keys required)")
    order = await db.get(Order, order_id)
    if not order or order.user_id != user.id:
        raise HTTPException(404, "Order not found or not owned by you")
    if order.status != OrderStatus.RESERVED.value:
        raise HTTPException(400, f"Order is not payable (status: {order.status})")
    existing = await db.execute(
        select(Payment).where(Payment.order_id == order.id, Payment.status == PaymentStatus.PENDING.value)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(409, "An active payment already exists for this order")

    items = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
    line_items = []
    for oi in items.scalars():
        tt = await db.get(TicketType, oi.ticket_type_id)
        line_items.append({
            "price_data": {
                "currency": "eur",
                "product_data": {"name": tt.name if tt else "Ticket"},
                "unit_amount": int(float(oi.unit_price) * 100),
            },
            "quantity": oi.quantity,
        })

    # Dynamic success URL with order id (Stripe substitutes only {CHECKOUT_SESSION_ID})
    success_url = f"{STRIPE_SUCCESS_URL}?session_id={{CHECKOUT_SESSION_ID}}&order={order.id}"

    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=line_items,
        success_url=success_url,
        cancel_url=STRIPE_CANCEL_URL,
        client_reference_id=order.reference,
        metadata={"order_id": str(order.id), "reference": order.reference},
        payment_intent_data={"metadata": {"order_id": str(order.id)}},
        expires_at=int(datetime.utcnow().timestamp()) + 1800,  # 30 min
    )

    payment = Payment(
        order_id=order.id,
        provider="stripe",
        provider_id=session.payment_intent,
        stripe_session_id=session.id,
        amount=order.total_amount,
        currency="EUR",
        status=PaymentStatus.PENDING.value,
    )
    db.add(payment)
    await db.commit()
    await log_audit(db, user.id, "payment.checkout_created", "Payment", payment.id, {"session": session.id})
    return CheckoutOut(session_id=session.id, url=session.url, order_id=order.id)

@router.get("/status/{order_id}")
async def order_status(order_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    order = await db.get(Order, order_id)
    if not order or order.user_id != user.id:
        raise HTTPException(404)
    pay = await db.execute(select(Payment).where(Payment.order_id == order.id).order_by(Payment.id.desc()))
    payment = pay.scalars().first()
    return {
        "order_id": order.id,
        "reference": order.reference,
        "status": order.status,
        "total_amount": float(order.total_amount),
        "currency": order.currency,
        "payment_status": payment.status if payment else None,
        "stripe_fee": float(payment.stripe_fee) if payment and payment.stripe_fee else None,
        "platform_fee": float(payment.platform_fee) if payment and payment.platform_fee else None,
    }

@router.get("/my-tickets")
async def my_tickets(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Ticket).join(OrderItem).join(Order).where(Order.user_id == user.id)
    )
    tickets = result.scalars().all()
    return [{"id": t.id, "code": t.code, "qr_data": t.qr_data, "is_used": t.is_used} for t in tickets]

@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(503, "Webhook secret not configured")
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.SignatureVerificationError):
        raise HTTPException(400, "Invalid signature")

    existing = await db.execute(select(StripeEvent).where(StripeEvent.event_id == event["id"]))
    if existing.scalar_one_or_none():
        return {"status": "already_processed"}

    evt = StripeEvent(event_id=event["id"], event_type=event["type"])
    db.add(evt)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        order_id = int(session.get("metadata", {}).get("order_id", 0))
        order = await db.get(Order, order_id)
        if order:
            paid = session.get("amount_total", 0) / 100.0
            if abs(float(order.total_amount) - paid) > 0.01:
                order.status = "payment_mismatch"
                await db.commit()
                return {"status": "amount_mismatch"}
            codes = await _issue_tickets_for_order(db, order)
            pay = await db.execute(select(Payment).where(Payment.stripe_session_id == session["id"]))
            payment = pay.scalar_one_or_none()
            if payment:
                payment.status = PaymentStatus.COMPLETED.value
                payment.provider_id = session.get("payment_intent")
                # Try to retrieve actual Stripe fee (only when known)
                try:
                    pi = stripe.PaymentIntent.retrieve(
                        session.get("payment_intent"),
                        expand=["latest_charge.balance_transaction"]
                    )
                    bt = getattr(pi.latest_charge, "balance_transaction", None)
                    if bt and getattr(bt, "fee", None) is not None:
                        payment.stripe_fee = bt.fee / 100.0
                except Exception:
                    pass  # fee unknown – leave null
                platform = float(order.total_amount) * (PLATFORM_FEE_PERCENT / 100.0)
                payment.platform_fee = platform
                org_id = None
                items = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
                first = items.scalars().first()
                if first:
                    tt = await db.get(TicketType, first.ticket_type_id)
                    if tt:
                        ev = await db.get(Event, tt.event_id)
                        if ev:
                            org_id = ev.organization_id
                db.add(LedgerEntry(
                    entry_type="payment_gross", reference_type="Order", reference_id=order.id,
                    organization_id=org_id, amount=float(order.total_amount),
                    description=f"Gross payment {order.reference}", idempotency_key=f"gross-{event['id']}",
                ))
                db.add(LedgerEntry(
                    entry_type="platform_fee", reference_type="Order", reference_id=order.id,
                    organization_id=org_id, amount=-platform,
                    description=f"Platform fee {PLATFORM_FEE_PERCENT}% {order.reference}", idempotency_key=f"fee-{event['id']}",
                ))
                net = float(order.total_amount) - platform
                db.add(LedgerEntry(
                    entry_type="organizer_net", reference_type="Order", reference_id=order.id,
                    organization_id=org_id, amount=net,
                    description=f"Net to organizer {order.reference}", idempotency_key=f"net-{event['id']}",
                ))
                await db.commit()
                user = await db.get(User, order.user_id)
                if user:
                    await queue_email(
                        db, user.email,
                        f"Potvrda narudžbe {order.reference}",
                        payment_success_body(order.reference, codes),
                        "payment_success", "Order", order.id, f"email-success-{event['id']}"
                    )
                await log_audit(db, None, "payment.completed", "Order", order.id, {"event": event["id"]})

    elif event["type"] == "checkout.session.expired":
        session = event["data"]["object"]
        order_id = int(session.get("metadata", {}).get("order_id", 0))
        order = await db.get(Order, order_id)
        if order and order.status == OrderStatus.RESERVED.value:
            order.status = OrderStatus.EXPIRED.value
            await db.commit()

    elif event["type"] == "payment_intent.payment_failed":
        pi = event["data"]["object"]
        order_id = int(pi.get("metadata", {}).get("order_id", 0))
        order = await db.get(Order, order_id)
        if order:
            pay = await db.execute(select(Payment).where(Payment.order_id == order.id))
            payment = pay.scalar_one_or_none()
            if payment:
                payment.status = PaymentStatus.FAILED.value
            await db.commit()
            user = await db.get(User, order.user_id)
            if user:
                await queue_email(
                    db, user.email, f"Plaćanje nije uspjelo {order.reference}",
                    payment_failed_body(order.reference), "payment_failed", "Order", order.id,
                    f"email-fail-{event['id']}"
                )

    elif event["type"] in ("charge.refunded", "refund.updated"):
        # Sync refund status from Stripe
        obj = event["data"]["object"]
        refund_id = obj.get("id") if event["type"] == "refund.updated" else obj.get("refunds", {}).get("data", [{}])[0].get("id")
        if refund_id:
            r = await db.execute(select(Refund).where(Refund.stripe_refund_id == refund_id))
            refund = r.scalar_one_or_none()
            if refund:
                refund.status = "succeeded"
                await db.commit()

    evt.success = True
    await db.commit()
    return {"status": "ok"}

@router.post("/refund")
async def create_refund(
    data: RefundIn,
    user: User = Depends(require_role(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.FINANCE_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(503, "Stripe not configured")
    payment = await db.get(Payment, data.payment_id)
    if not payment or payment.status != PaymentStatus.COMPLETED.value:
        raise HTTPException(400, "Payment not refundable")
    existing_refunds = await db.execute(select(Refund).where(Refund.payment_id == payment.id))
    already = sum(float(r.amount) for r in existing_refunds.scalars())
    remaining = float(payment.amount) - already
    amount = data.amount if data.amount is not None else remaining
    if amount <= 0 or amount > remaining + 0.01:
        raise HTTPException(400, "Invalid refund amount")
    refund = stripe.Refund.create(
        payment_intent=payment.provider_id,
        amount=int(amount * 100),
        metadata={"payment_id": str(payment.id)},
    )
    r = Refund(
        payment_id=payment.id, amount=amount, reason=data.reason,
        status="succeeded", stripe_refund_id=refund.id,
    )
    db.add(r)
    if amount >= remaining - 0.01:
        payment.status = PaymentStatus.REFUNDED.value
    db.add(LedgerEntry(
        entry_type="refund", reference_type="Payment", reference_id=payment.id,
        amount=-amount, description=f"Refund {refund.id}", idempotency_key=f"refund-{refund.id}",
    ))
    await db.commit()
    order = await db.get(Order, payment.order_id)
    if order:
        u = await db.get(User, order.user_id)
        if u:
            await queue_email(
                db, u.email, f"Refundacija {order.reference}",
                refund_body(order.reference, amount), "refund", "Payment", payment.id,
                f"email-refund-{refund.id}"
            )
    await log_audit(db, user.id, "payment.refunded", "Refund", r.id, {"amount": amount})
    return {"status": "refunded", "refund_id": refund.id, "amount": amount}

@router.get("/admin")
async def admin_payments(user: User = Depends(require_role(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.FINANCE_ADMIN)), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Payment).order_by(Payment.created_at.desc()).limit(100))
    return [{
        "id": p.id, "order_id": p.order_id, "amount": float(p.amount),
        "status": p.status, "provider": p.provider,
        "platform_fee": float(p.platform_fee) if p.platform_fee else None,
        "stripe_fee": float(p.stripe_fee) if p.stripe_fee else None,
    } for p in result.scalars()]

@router.get("/organizer")
async def organizer_payments(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Organizer sees only their own events' payments. Finance viewer is read-only."""
    memberships = await db.execute(select(OrganizationMember).where(OrganizationMember.user_id == user.id))
    org_ids = [m.organization_id for m in memberships.scalars()]
    if not org_ids and user.role not in (UserRole.SUPERADMIN.value, UserRole.ADMIN.value, UserRole.FINANCE_ADMIN.value):
        raise HTTPException(403)
    # For simplicity return ledger entries for those orgs
    result = await db.execute(
        select(LedgerEntry).where(LedgerEntry.organization_id.in_(org_ids) if org_ids else True).limit(100)
    )
    return [{
        "id": e.id, "type": e.entry_type, "amount": float(e.amount),
        "description": e.description, "org_id": e.organization_id,
    } for e in result.scalars()]
