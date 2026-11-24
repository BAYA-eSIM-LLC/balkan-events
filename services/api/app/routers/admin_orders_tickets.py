"""Phase 11: detailed Orders and Tickets admin views.
Uses existing Order/Ticket models. No QR data mutation.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional
from app.database import get_db
from app.deps import require_role
from app.models.user import User, UserRole
from app.models.order import Order, OrderItem
from app.models.ticket import Ticket, TicketType
from app.models.event import Event
from app.models.organization import Organization
from app.models.payment import Payment, Refund
from app.models.audit import AuditLog

from app.routers.admin_system import ADMIN_ONLY, log_audit, paginate

router = APIRouter(prefix="/admin", tags=["admin-orders-tickets"])

@router.get("/orders/{order_id}")
async def order_detail(order_id: int, user: User = Depends(require_role(*ADMIN_ONLY)), db: AsyncSession = Depends(get_db)):
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    items = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
    item_rows = []
    for oi in items.scalars():
        tt = await db.get(TicketType, oi.ticket_type_id)
        event = await db.get(Event, tt.event_id) if tt else None
        item_rows.append({
            "ticket_type_id": oi.ticket_type_id,
            "ticket_type_name": tt.name if tt else None,
            "event_id": event.id if event else None,
            "event_title": event.title if event else None,
            "quantity": oi.quantity,
            "unit_price": float(oi.unit_price),
        })
    tickets = await db.execute(
        select(Ticket).join(OrderItem).where(OrderItem.order_id == order.id)
    )
    ticket_rows = [{
        "id": t.id,
        "code": t.code,
        "is_used": t.is_used,
        "used_at": t.used_at.isoformat() if t.used_at else None,
        "qr_data_preview": (t.qr_data or "")[:20] + "..." if t.qr_data else None,
    } for t in tickets.scalars()]
    buyer = await db.get(User, order.user_id)
    orgs = {}
    for it in item_rows:
        if it.get("event_id"):
            ev = await db.get(Event, it["event_id"])
            if ev and ev.organization_id:
                org = await db.get(Organization, ev.organization_id)
                if org:
                    orgs[org.id] = {"id": org.id, "name": org.name}
    payments = (await db.execute(select(Payment).where(Payment.order_id == order.id))).scalars().all()
    pay_rows = []
    for pay in payments:
        refunds = (await db.execute(select(Refund).where(Refund.payment_id == pay.id))).scalars().all()
        pay_rows.append({
            "id": pay.id, "provider": pay.provider, "status": pay.status,
            "amount": float(pay.amount) if pay.amount else 0, "currency": pay.currency,
            "stripe_fee": float(pay.stripe_fee) if pay.stripe_fee is not None else None,
            "platform_fee": float(pay.platform_fee) if pay.platform_fee is not None else None,
            "provider_id_prefix": (pay.provider_id or "")[:8] + "..." if pay.provider_id else None,
            "created_at": pay.created_at.isoformat() if pay.created_at else None,
            "refunds": [{"id": r.id, "amount": float(r.amount), "reason": r.reason, "status": r.status, "created_at": r.created_at.isoformat() if r.created_at else None} for r in refunds],
        })
    audits = (await db.execute(select(AuditLog).where(AuditLog.entity_type == "Order", AuditLog.entity_id == order.id).order_by(AuditLog.created_at.desc()).limit(20))).scalars().all()
    return {
        "id": order.id,
        "reference": order.reference,
        "status": order.status,
        "total_amount": float(order.total_amount),
        "currency": order.currency,
        "user_id": order.user_id,
        "buyer": {"id": buyer.id, "email": buyer.email, "full_name": buyer.full_name} if buyer else None,
        "organizers": list(orgs.values()),
        "reserved_until": order.reserved_until.isoformat() if order.reserved_until else None,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "items": item_rows,
        "tickets": ticket_rows,
        "payments": pay_rows,
        "audit": [{"action": a.action, "user_id": a.user_id, "created_at": a.created_at.isoformat() if a.created_at else None, "details": a.details} for a in audits],
        "note": "No card data returned. Refund endpoint exists but requires Stripe. No orders CSV export.",
    }

@router.get("/tickets")
async def list_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    q: Optional[str] = None,
    status: Optional[str] = None,
    sort: str = Query("id"),
    order: str = Query("desc"),
    user: User = Depends(require_role(*ADMIN_ONLY)),
    db: AsyncSession = Depends(get_db)
):
    page, page_size = paginate(page, page_size)
    query = select(Ticket)
    if status == "used":
        query = query.where(Ticket.is_used == True)
    elif status == "valid":
        query = query.where(Ticket.is_used == False)
    if q:
        term = f"%{q.strip()}%"
        event_ids = [r[0] for r in (await db.execute(select(Event.id).where(Event.title.ilike(term)))).all()]
        type_ids = [r[0] for r in (await db.execute(select(TicketType.id).where(TicketType.event_id.in_(event_ids)))).all()] if event_ids else []
        order_ids = [r[0] for r in (await db.execute(select(Order.id).where(Order.reference.ilike(term)))).all()]
        buyer_ids = [r[0] for r in (await db.execute(select(User.id).where(or_(User.email.ilike(term), User.full_name.ilike(term))))).all()]
        if buyer_ids:
            order_ids += [r[0] for r in (await db.execute(select(Order.id).where(Order.user_id.in_(buyer_ids)))).all()]
        item_ids = [r[0] for r in (await db.execute(select(OrderItem.id).where(OrderItem.order_id.in_(order_ids)))).all()] if order_ids else []
        conds = [Ticket.code.ilike(term)]
        if type_ids:
            conds.append(Ticket.ticket_type_id.in_(type_ids))
        if item_ids:
            conds.append(Ticket.order_item_id.in_(item_ids))
        if q.strip().isdigit():
            conds.append(Ticket.id == int(q.strip()))
        query = query.where(or_(*conds))
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    col = {"id": Ticket.id, "created_at": Ticket.created_at, "code": Ticket.code}.get(sort, Ticket.id)
    query = query.order_by(col.asc() if order == "asc" else col.desc())
    tickets = (await db.execute(query.offset((page - 1) * page_size).limit(page_size))).scalars().all()
    rows = []
    for tix in tickets:
        tt = await db.get(TicketType, tix.ticket_type_id)
        ev = await db.get(Event, tt.event_id) if tt else None
        oi = await db.get(OrderItem, tix.order_item_id) if tix.order_item_id else None
        order = await db.get(Order, oi.order_id) if oi else None
        derived = "used" if tix.is_used else "valid"
        if order and order.status in ("cancelled", "refunded"):
            derived = order.status
        if status in ("cancelled", "refunded") and derived != status:
            continue
        rows.append({
            "id": tix.id, "code": tix.code, "is_used": tix.is_used,
            "used_at": tix.used_at.isoformat() if tix.used_at else None,
            "ticket_type": tt.name if tt else None,
            "price": float(tt.price) if tt and tt.price else None,
            "event": ev.title if ev else None,
            "order_reference": order.reference if order else None,
            "status": derived,
            "created_at": tix.created_at.isoformat() if tix.created_at else None,
        })
    return {"total": total or 0, "page": page, "page_size": page_size, "items": rows, "note": "Ticket model has only is_used. cancelled/refunded come from the order."}


@router.get("/tickets/{ticket_id}")
async def ticket_detail(ticket_id: int, user: User = Depends(require_role(*ADMIN_ONLY)), db: AsyncSession = Depends(get_db)):
    tix = await db.get(Ticket, ticket_id)
    if not tix:
        raise HTTPException(404, "Ticket not found")
    tt = await db.get(TicketType, tix.ticket_type_id)
    ev = await db.get(Event, tt.event_id) if tt else None
    org = await db.get(Organization, ev.organization_id) if ev else None
    oi = await db.get(OrderItem, tix.order_item_id) if tix.order_item_id else None
    order = await db.get(Order, oi.order_id) if oi else None
    buyer = await db.get(User, order.user_id) if order else None
    derived = "used" if tix.is_used else "valid"
    if order and order.status in ("cancelled", "refunded"):
        derived = order.status
    return {
        "id": tix.id, "code": tix.code, "status": derived, "is_used": tix.is_used,
        "used_at": tix.used_at.isoformat() if tix.used_at else None, "used_by": tix.used_by,
        "created_at": tix.created_at.isoformat() if tix.created_at else None,
        "qr_present": bool(tix.qr_data),
        "ticket_type": tt.name if tt else None,
        "price": float(tt.price) if tt and tt.price else None,
        "event": {"id": ev.id, "title": ev.title, "city": ev.city, "start_at": ev.start_at.isoformat() if ev and ev.start_at else None} if ev else None,
        "organizer": {"id": org.id, "name": org.name} if org else None,
        "order": {"id": order.id, "reference": order.reference, "status": order.status, "created_at": order.created_at.isoformat() if order.created_at else None} if order else None,
        "buyer": {"id": buyer.id, "email": buyer.email, "full_name": buyer.full_name} if buyer else None,
        "note": "Full qr_data is not returned. No ticket void endpoint exists.",
    }
