from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import uuid, secrets
from app.database import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.models.ticket import Ticket, TicketType
from app.models.inventory import TicketInventory
from app.models.reservation import Reservation
from app.models.user import User
from app.deps import get_current_user
from app.routers.admin_system import log_audit

router = APIRouter(prefix="/orders", tags=["orders"])

class OrderItemIn(BaseModel):
    ticket_type_id: int
    quantity: int

class CreateOrderIn(BaseModel):
    items: List[OrderItemIn]
    idempotency_key: Optional[str] = None

class OrderOut(BaseModel):
    id: int
    reference: str
    status: str
    total_amount: float
    currency: str
    reserved_until: Optional[datetime]
    created_at: datetime
    class Config:
        from_attributes = True

@router.post("", response_model=OrderOut)
async def create_order(data: CreateOrderIn, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Idempotency
    if data.idempotency_key:
        existing = await db.execute(select(Order).where(Order.idempotency_key == data.idempotency_key))
        if existing.scalar_one_or_none():
            raise HTTPException(409, "Duplicate request")
    total = 0
    order = Order(
        user_id=user.id,
        status=OrderStatus.RESERVED,
        total_amount=0,
        currency="EUR",
        reference=f"BE-{uuid.uuid4().hex[:10].upper()}",
        reserved_until=datetime.utcnow() + timedelta(minutes=15),
        idempotency_key=data.idempotency_key,
    )
    db.add(order)
    await db.flush()
    for item in data.items:
        # Atomic inventory check + reserve
        inv = await db.execute(
            select(TicketInventory).where(TicketInventory.ticket_type_id == item.ticket_type_id).with_for_update()
        )
        inventory = inv.scalar_one_or_none()
        if not inventory or inventory.available < item.quantity:
            await db.rollback()
            raise HTTPException(400, f"Insufficient inventory for ticket type {item.ticket_type_id}")
        tt = await db.get(TicketType, item.ticket_type_id)
        inventory.available -= item.quantity
        inventory.reserved += item.quantity
        inventory.version += 1
        oi = OrderItem(order_id=order.id, ticket_type_id=item.ticket_type_id, quantity=item.quantity, unit_price=tt.price)
        db.add(oi)
        total += float(tt.price) * item.quantity
        # Reservation record
        res = Reservation(ticket_type_id=item.ticket_type_id, user_id=user.id, quantity=item.quantity, expires_at=order.reserved_until)
        db.add(res)
    order.total_amount = total
    await db.commit()
    await db.refresh(order)
    await log_audit(db, user.id, "order.created", "Order", order.id, {"reference": order.reference})
    return order

@router.get("/me", response_model=List[OrderOut])
async def my_orders(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc()))
    return result.scalars().all()

@router.post("/{order_id}/confirm")
async def confirm_order(order_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Mark as PAID and issue tickets. No Stripe in this phase."""
    order = await db.get(Order, order_id)
    if not order or order.user_id != user.id:
        raise HTTPException(404)
    if order.status != OrderStatus.RESERVED:
        raise HTTPException(400, "Order not in reserved state")
    # Issue tickets
    items = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
    for oi in items.scalars():
        inv = await db.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == oi.ticket_type_id).with_for_update())
        inventory = inv.scalar_one()
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
    order.status = OrderStatus.PAID
    await db.commit()
    await log_audit(db, user.id, "order.confirmed", "Order", order.id)
    return {"status": "PAID", "reference": order.reference}

@router.post("/{order_id}/cancel")
async def cancel_order(order_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    order = await db.get(Order, order_id)
    if not order or order.user_id != user.id:
        raise HTTPException(404)
    if order.status not in (OrderStatus.RESERVED, OrderStatus.PENDING):
        raise HTTPException(400)
    items = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
    for oi in items.scalars():
        inv = await db.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == oi.ticket_type_id).with_for_update())
        inventory = inv.scalar_one()
        inventory.reserved -= oi.quantity
        inventory.available += oi.quantity
    order.status = OrderStatus.CANCELLED
    await db.commit()
    await log_audit(db, user.id, "order.cancelled", "Order", order.id)
    return {"status": "CANCELLED"}
