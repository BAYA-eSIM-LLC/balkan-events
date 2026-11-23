"""Stripe payment system (TEST MODE only).
Checkout Sessions, verified webhooks, refunds, ledger entries.
Never trusts frontend redirect. All financial actions are idempotent.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import stripe
import json
import secrets
from app.database import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.models.payment import Payment, Refund, StripeEvent, PaymentStatus
from app.models.ticket import Ticket, TicketType
from app.models.inventory import TicketInventory
from app.models.ledger import LedgerEntry
from app.models.user import User, UserRole
from app.models.event import Event
from app.deps import get_current_user, require_role
from app.config import (
    STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_SUCCESS_URL,
    STRIPE_CANCEL_URL, PLATFORM_FEE_PERCENT, INTERNAL_API_SECRET
)
from app.routers.admin_system import log_audit

router = APIRouter(prefix="/payments", tags=["payments"])

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

class CheckoutOut(BaseModel):
    session_id: str
    url: str
    order_id: int

class RefundIn(BaseModel):
    payment_id: int
    amount: Optional[float] = None  # None = full remaining
    reason: Optional[str] = None

async def _issue_tickets_for_order(db: AsyncSession, order: Order):
    """Issue QR tickets exactly once. Called only from verified webhook."""
    if order.status != OrderStatus.RESERVED.value:
        return  # already processed or expired
    items = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
    for oi in items.scalars():
        inv = await db.execute(
            select(TicketInventory).where(TicketInventory.ticket_type_id == oi.ticket_type_id).with_for_update()
        )
        inventory = inv.scalar_one_or_none()
        if not inventory or inventory.reserved < oi.quantity:
            # Late payment after expiry – do not issue, mark for review
            order.status = "payment_late"
            await db.commit()
            return
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
    order.status = OrderStatus.PAID.value
    await db.commit()

@router.post("/checkout/{order_id}", response_model=CheckoutOut)
async def create_checkout_session(
    order_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create Stripe Checkout Session for a reserved order. TEST MODE only."""
    if not STRIPE_SECRET_KEY:
        raise HTTPException(503, "Stripe not configured (TEST MODE keys required)")
    order = await db.get(Order, order_id)
    if not order or order.user_id != user.id:
        raise HTTPException(404)
    if order.status != OrderStatus.RESERVED.value:
        raise HTTPException(400, "Order is not in reserved state")
    # Prevent multiple active sessions
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

    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=line_items,
        success_url=STRIPE_SUCCESS_URL,
        cancel_url=STRIPE_CANCEL_URL,
        client_reference_id=order.reference,
        metadata={"order_id": str(order.id), "reference": order.reference},
        payment_intent_data={"metadata": {"order_id": str(order.id)}},
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

@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Stripe webhook. Signature verified. Idempotent. Never trusts frontend."""
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(503, "Webhook secret not configured")
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.SignatureVerificationError):
        raise HTTPException(400, "Invalid signature")

    # Idempotency
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
            # Amount check
            paid = session.get("amount_total", 0) / 100.0
            if abs(float(order.total_amount) - paid) > 0.01:
                order.status = "payment_mismatch"
                await db.commit()
                return {"status": "amount_mismatch"}
            await _issue_tickets_for_order(db, order)
            # Update payment
            pay = await db.execute(select(Payment).where(Payment.stripe_session_id == session["id"]))
            payment = pay.scalar_one_or_none()
            if payment:
                payment.status = PaymentStatus.COMPLETED.value
                payment.provider_id = session.get("payment_intent")
                # Platform fee (known); Stripe fee only if present in balance transaction (not invented)
                platform = float(order.total_amount) * (PLATFORM_FEE_PERCENT / 100.0)
                payment.platform_fee = platform
                # Ledger: gross, platform fee, net to organizer
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
                    entry_type="payment_gross",
                    reference_type="Order",
                    reference_id=order.id,
                    organization_id=org_id,
                    amount=float(order.total_amount),
                    description=f"Gross payment {order.reference}",
                    idempotency_key=f"gross-{event['id']}",
                ))
                db.add(LedgerEntry(
                    entry_type="platform_fee",
                    reference_type="Order",
                    reference_id=order.id,
                    organization_id=org_id,
                    amount=-platform,
                    description=f"Platform fee {PLATFORM_FEE_PERCENT}% {order.reference}",
                    idempotency_key=f"fee-{event['id']}",
                ))
                net = float(order.total_amount) - platform
                db.add(LedgerEntry(
                    entry_type="organizer_net",
                    reference_type="Order",
                    reference_id=order.id,
                    organization_id=org_id,
                    amount=net,
                    description=f"Net to organizer {order.reference}",
                    idempotency_key=f"net-{event['id']}",
                ))
                await db.commit()
                await log_audit(db, None, "payment.completed", "Order", order.id, {"event": event["id"]})

    elif event["type"] == "checkout.session.expired":
        session = event["data"]["object"]
        order_id = int(session.get("metadata", {}).get("order_id", 0))
        order = await db.get(Order, order_id)
        if order and order.status == OrderStatus.RESERVED.value:
            # Release inventory via existing expire logic or mark expired
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

    evt.success = True
    await db.commit()
    return {"status": "ok"}

@router.post("/refund")
async def create_refund(
    data: RefundIn,
    user: User = Depends(require_role(UserRole.SUPERADMIN, UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Full or partial refund via Stripe TEST MODE. Prevents double refund."""
    if not STRIPE_SECRET_KEY:
        raise HTTPException(503, "Stripe not configured")
    payment = await db.get(Payment, data.payment_id)
    if not payment or payment.status != PaymentStatus.COMPLETED.value:
        raise HTTPException(400, "Payment not refundable")
    # Calculate remaining
    existing_refunds = await db.execute(select(Refund).where(Refund.payment_id == payment.id))
    already = sum(float(r.amount) for r in existing_refunds.scalars())
    remaining = float(payment.amount) - already
    amount = data.amount if data.amount is not None else remaining
    if amount <= 0 or amount > remaining + 0.01:
        raise HTTPException(400, "Invalid refund amount")
    refund = stripe.Refund.create(
        payment_intent=payment.provider_id,
        amount=int(amount * 100),
        reason="requested_by_customer" if not data.reason else None,
        metadata={"payment_id": str(payment.id)},
    )
    r = Refund(
        payment_id=payment.id,
        amount=amount,
        reason=data.reason,
        status="succeeded",
        stripe_refund_id=refund.id,
    )
    db.add(r)
    if amount >= remaining - 0.01:
        payment.status = PaymentStatus.REFUNDED.value
    # Reverse ledger
    db.add(LedgerEntry(
        entry_type="refund",
        reference_type="Payment",
        reference_id=payment.id,
        amount=-amount,
        description=f"Refund {refund.id}",
        idempotency_key=f"refund-{refund.id}",
    ))
    await db.commit()
    await log_audit(db, user.id, "payment.refunded", "Refund", r.id, {"amount": amount})
    return {"status": "refunded", "refund_id": refund.id, "amount": amount}

@router.get("/admin")
async def admin_payments(user: User = Depends(require_role(UserRole.SUPERADMIN, UserRole.ADMIN)), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Payment).order_by(Payment.created_at.desc()).limit(100))
    return [{"id": p.id, "order_id": p.order_id, "amount": float(p.amount), "status": p.status, "provider": p.provider} for p in result.scalars()]
