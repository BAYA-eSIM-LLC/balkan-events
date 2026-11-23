"""Phase 11: detailed Orders and Tickets admin views.
Uses existing Order/Ticket models. No QR data mutation.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from app.database import get_db
from app.deps import require_role
from app.models.user import User, UserRole
from app.models.order import Order, OrderItem
from app.models.ticket import Ticket, TicketType
from app.models.event import Event
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
    return {
        "id": order.id,
        "reference": order.reference,
        "status": order.status,
        "total_amount": float(order.total_amount),
        "currency": order.currency,
        "user_id": order.user_id,
        "reserved_until": order.reserved_until.isoformat() if order.reserved_until else None,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "items": item_rows,
        "tickets": ticket_rows,
    }

@router.get("/tickets")
async def list_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    code: Optional[str] = None,
    used: Optional[bool] = None,
    user: User = Depends(require_role(*ADMIN_ONLY)),
    db: AsyncSession = Depends(get_db)
):
    page, page_size = paginate(page, page_size)
    q = select(Ticket)
    if code:
        q = q.where(Ticket.code.ilike(f"%{code}%"))
    if used is not None:
        q = q.where(Ticket.is_used == used)
    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    q = q.order_by(Ticket.id.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    rows = []
    for t in result.scalars():
        tt = await db.get(TicketType, t.ticket_type_id)
        rows.append({
            "id": t.id,
            "code": t.code,
            "is_used": t.is_used,
            "used_at": t.used_at.isoformat() if t.used_at else None,
            "ticket_type": tt.name if tt else None,
            "status": "used" if t.is_used else "valid",
        })
    return {"total": total or 0, "page": page, "page_size": page_size, "items": rows}
