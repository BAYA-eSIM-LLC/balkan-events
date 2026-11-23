from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.database import get_db
from app.models.pos import SalesPoint, SalesPointStaff, CashRegister, CashTransaction
from app.models.user import User, UserRole
from app.models.organization import OrganizationMember
from app.models.event import Event
from app.models.seat_map import Seat, SeatReservation, SeatRow, Sector, SeatMap
from app.models.order import Order, OrderItem, OrderStatus
from app.models.ticket import Ticket, TicketType
from app.models.inventory import TicketInventory
from app.deps import get_current_user, require_role, get_org_member
from app.routers.admin_system import log_audit
import uuid, secrets

router = APIRouter(prefix="/pos", tags=["pos"])
admin_router = APIRouter(prefix="/admin/pos", tags=["admin-pos"])

ADMIN_ROLES = (UserRole.ADMIN, UserRole.SUPERADMIN)


class SalesPointCreate(BaseModel):
    organization_id: int
    name: str
    address: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None


class StaffAssign(BaseModel):
    user_id: int
    role: str = "SELLER"


class RegisterOpen(BaseModel):
    sales_point_id: int
    opening_balance: float = 0


class RegisterClose(BaseModel):
    closing_balance: float


class POSSaleRequest(BaseModel):
    sales_point_id: int
    register_id: int
    seat_ids: Optional[List[int]] = None
    ticket_type_id: Optional[int] = None
    quantity: int = 1
    payment_method: str = "CASH"
    idempotency_key: Optional[str] = None


async def _staff_for_point(db: AsyncSession, sales_point_id: int, user: User) -> SalesPointStaff:
    if user.role in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        return None
    result = await db.execute(
        select(SalesPointStaff).where(
            SalesPointStaff.sales_point_id == sales_point_id,
            SalesPointStaff.user_id == user.id,
            SalesPointStaff.is_active == True,
        )
    )
    staff = result.scalar_one_or_none()
    if not staff:
        raise HTTPException(403, "Not assigned to this sales point")
    return staff


@router.post("/sales-points")
async def create_sales_point(data: SalesPointCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        await get_org_member(data.organization_id, user, db)
    sp = SalesPoint(
        organization_id=data.organization_id,
        name=data.name,
        address=data.address,
        contact_phone=data.contact_phone,
        contact_email=data.contact_email,
    )
    db.add(sp)
    await db.commit()
    await db.refresh(sp)
    await log_audit(db, user.id, "pos.sales_point.created", "SalesPoint", sp.id)
    return {"id": sp.id, "name": sp.name}


@router.get("/sales-points")
async def list_sales_points(organization_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        await get_org_member(organization_id, user, db)
    result = await db.execute(select(SalesPoint).where(SalesPoint.organization_id == organization_id))
    points = result.scalars().all()
    return [{"id": p.id, "name": p.name, "address": p.address, "is_active": p.is_active} for p in points]


@router.post("/sales-points/{point_id}/staff")
async def assign_staff(point_id: int, data: StaffAssign, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    sp = await db.get(SalesPoint, point_id)
    if not sp:
        raise HTTPException(404, "Sales point not found")
    if user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        await get_org_member(sp.organization_id, user, db)
    if data.role not in ("SELLER", "MANAGER", "ADMIN"):
        raise HTTPException(400, "Invalid role")
    staff = SalesPointStaff(sales_point_id=point_id, user_id=data.user_id, role=data.role)
    db.add(staff)
    await db.commit()
    await db.refresh(staff)
    await log_audit(db, user.id, "pos.staff.assigned", "SalesPointStaff", staff.id, {"role": data.role})
    return {"id": staff.id, "role": staff.role}


@router.post("/registers/open")
async def open_register(data: RegisterOpen, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await _staff_for_point(db, data.sales_point_id, user)
    # Only one open register per point
    existing = await db.execute(
        select(CashRegister).where(CashRegister.sales_point_id == data.sales_point_id, CashRegister.status == "OPEN")
    )
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Register already open")
    reg = CashRegister(
        sales_point_id=data.sales_point_id,
        opened_by=user.id,
        opening_balance=data.opening_balance,
        status="OPEN",
    )
    db.add(reg)
    await db.commit()
    await db.refresh(reg)
    await log_audit(db, user.id, "pos.register.opened", "CashRegister", reg.id)
    return {"id": reg.id, "status": reg.status, "opening_balance": float(reg.opening_balance)}


@router.post("/registers/{register_id}/close")
async def close_register(register_id: int, data: RegisterClose, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    reg = await db.get(CashRegister, register_id)
    if not reg or reg.status != "OPEN":
        raise HTTPException(404, "Open register not found")
    await _staff_for_point(db, reg.sales_point_id, user)
    # Sum transactions
    total = await db.scalar(
        select(func.coalesce(func.sum(CashTransaction.amount), 0)).where(CashTransaction.register_id == register_id)
    )
    expected = float(reg.opening_balance) + float(total or 0)
    reg.closing_balance = data.closing_balance
    reg.expected_balance = expected
    reg.variance = float(data.closing_balance) - expected
    reg.status = "CLOSED"
    reg.closed_by = user.id
    reg.closed_at = datetime.utcnow()
    await db.commit()
    await log_audit(db, user.id, "pos.register.closed", "CashRegister", reg.id, {"variance": float(reg.variance)})
    return {"id": reg.id, "expected": expected, "actual": float(data.closing_balance), "variance": float(reg.variance)}


@router.post("/sale")
async def pos_sale(data: POSSaleRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Cash sale. Uses existing inventory and seat locking. Idempotent."""
    if data.idempotency_key:
        existing = await db.execute(select(CashTransaction).where(CashTransaction.idempotency_key == data.idempotency_key))
        prev = existing.scalar_one_or_none()
        if prev:
            return {"status": "ok", "transaction_id": prev.id, "order_id": prev.order_id, "idempotent": True}

    await _staff_for_point(db, data.sales_point_id, user)
    reg = await db.get(CashRegister, data.register_id)
    if not reg or reg.status != "OPEN" or reg.sales_point_id != data.sales_point_id:
        raise HTTPException(400, "Register not open or mismatch")

    if data.payment_method != "CASH":
        raise HTTPException(400, "Only CASH is supported in this phase")

    now = datetime.utcnow()
    seat_ids = data.seat_ids or []
    total = 0
    tickets_created = []

    if seat_ids:
        # Lock seats
        result = await db.execute(select(Seat).where(Seat.id.in_(seat_ids)).with_for_update())
        seats = result.scalars().all()
        if len(seats) != len(set(seat_ids)):
            raise HTTPException(400, "Seat not found")
        for seat in seats:
            if seat.status == "SOLD":
                raise HTTPException(409, f"Seat {seat.id} already sold")
            if seat.status == "RESERVED":
                # Check if reserved by someone else and not expired
                active = await db.execute(
                    select(SeatReservation).where(
                        SeatReservation.seat_id == seat.id,
                        SeatReservation.status == "ACTIVE",
                        SeatReservation.expires_at > now,
                    )
                )
                if active.scalar_one_or_none():
                    raise HTTPException(409, f"Seat {seat.id} is reserved")
            seat.status = "SOLD"
        # Price from first seat's sector
        row = await db.get(SeatRow, seats[0].row_id)
        sector = await db.get(Sector, row.sector_id)
        total = sum(float(s.price_override) if s.price_override is not None else float(sector.base_price) for s in seats)
        # Create order + tickets
        order = Order(
            user_id=user.id,
            status=OrderStatus.PAID.value,
            total_amount=total,
            currency="EUR",
            reference=f"POS-{uuid.uuid4().hex[:10].upper()}",
        )
        db.add(order)
        await db.flush()
        # Ensure ticket type
        sm = await db.get(SeatMap, sector.seat_map_id)
        tt_res = await db.execute(select(TicketType).where(TicketType.event_id == sm.event_id, TicketType.name == "Seat Map"))
        tt = tt_res.scalar_one_or_none()
        if not tt:
            tt = TicketType(event_id=sm.event_id, name="Seat Map", price=0, quantity_total=100000, is_active=True)
            db.add(tt)
            await db.flush()
            db.add(TicketInventory(ticket_type_id=tt.id, available=100000, reserved=0, sold=0, version=1))
            await db.flush()
        oi = OrderItem(order_id=order.id, ticket_type_id=tt.id, quantity=len(seats), unit_price=total / len(seats))
        db.add(oi)
        await db.flush()
        for seat in seats:
            code = secrets.token_urlsafe(16)
            ticket = Ticket(ticket_type_id=tt.id, order_item_id=oi.id, code=code, qr_data=f"BE:{code}:{order.id}", is_used=False, seat_id=seat.id)
            db.add(ticket)
            tickets_created.append(code)
    elif data.ticket_type_id:
        inv = await db.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == data.ticket_type_id).with_for_update())
        inventory = inv.scalar_one_or_none()
        if not inventory or inventory.available < data.quantity:
            raise HTTPException(400, "Insufficient inventory")
        tt = await db.get(TicketType, data.ticket_type_id)
        inventory.available -= data.quantity
        inventory.sold += data.quantity
        total = float(tt.price) * data.quantity
        order = Order(user_id=user.id, status=OrderStatus.PAID.value, total_amount=total, currency="EUR", reference=f"POS-{uuid.uuid4().hex[:10].upper()}")
        db.add(order)
        await db.flush()
        oi = OrderItem(order_id=order.id, ticket_type_id=tt.id, quantity=data.quantity, unit_price=tt.price)
        db.add(oi)
        await db.flush()
        for _ in range(data.quantity):
            code = secrets.token_urlsafe(16)
            ticket = Ticket(ticket_type_id=tt.id, order_item_id=oi.id, code=code, qr_data=f"BE:{code}:{order.id}", is_used=False)
            db.add(ticket)
            tickets_created.append(code)
    else:
        raise HTTPException(400, "Provide seat_ids or ticket_type_id")

    tx = CashTransaction(
        register_id=reg.id,
        type="SALE",
        amount=total,
        order_id=order.id,
        seat_id=seat_ids[0] if seat_ids else None,
        created_by=user.id,
        idempotency_key=data.idempotency_key,
    )
    db.add(tx)
    await db.commit()
    await log_audit(db, user.id, "pos.sale", "Order", order.id, {"amount": total, "method": "CASH"})
    return {"status": "ok", "order_id": order.id, "reference": order.reference, "total": total, "tickets": tickets_created}


@router.post("/sale/{order_id}/void")
async def void_sale(order_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Void a POS sale. Creates a compensating transaction. Does not delete original."""
    order = await db.get(Order, order_id)
    if not order or not order.reference.startswith("POS-"):
        raise HTTPException(404, "POS order not found")
    if order.status != OrderStatus.PAID.value:
        raise HTTPException(400, "Order not paid")
    # Find original transaction
    tx_res = await db.execute(select(CashTransaction).where(CashTransaction.order_id == order_id, CashTransaction.type == "SALE"))
    original = tx_res.scalar_one_or_none()
    if not original:
        raise HTTPException(404, "Original transaction not found")
    # Release seats if any
    tickets = await db.execute(select(Ticket).where(Ticket.order_item_id.in_(
        select(OrderItem.id).where(OrderItem.order_id == order_id)
    )))
    for ticket in tickets.scalars():
        if ticket.seat_id:
            seat = await db.get(Seat, ticket.seat_id)
            if seat and seat.status == "SOLD":
                locked = await db.execute(select(Seat).where(Seat.id == seat.id).with_for_update())
                seat = locked.scalar_one()
                seat.status = "FREE"
            ticket.seat_id = None
    order.status = OrderStatus.CANCELLED.value
    void_tx = CashTransaction(
        register_id=original.register_id,
        type="REFUND",
        amount=-float(original.amount),
        order_id=order.id,
        created_by=user.id,
        note="VOID",
    )
    db.add(void_tx)
    await db.commit()
    await log_audit(db, user.id, "pos.sale.voided", "Order", order.id)
    return {"status": "voided", "refund_amount": float(original.amount)}


@admin_router.get("/sales-points")
async def admin_list_points(user: User = Depends(require_role(*ADMIN_ROLES)), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SalesPoint))
    points = result.scalars().all()
    return [{"id": p.id, "name": p.name, "organization_id": p.organization_id, "is_active": p.is_active} for p in points]


@admin_router.get("/registers")
async def admin_list_registers(user: User = Depends(require_role(*ADMIN_ROLES)), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CashRegister).order_by(CashRegister.opened_at.desc()).limit(100))
    regs = result.scalars().all()
    return [{"id": r.id, "sales_point_id": r.sales_point_id, "status": r.status, "opening_balance": float(r.opening_balance), "variance": float(r.variance) if r.variance else None} for r in regs]
