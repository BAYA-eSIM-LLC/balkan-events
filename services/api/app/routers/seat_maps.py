from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.database import get_db
from app.models.seat_map import SeatMap, Sector, SeatRow, Seat, SeatReservation
from app.models.event import Event
from app.models.user import User, UserRole
from app.models.organization import OrganizationMember
from app.deps import get_current_user, require_role, get_org_member
from app.routers.admin_system import log_audit

router = APIRouter(prefix="/seat-maps", tags=["seat-maps"])
admin_router = APIRouter(prefix="/admin/seat-maps", tags=["admin-seat-maps"])

ADMIN_ROLES = (UserRole.ADMIN, UserRole.SUPERADMIN)


class SeatMapCreate(BaseModel):
    event_id: int
    organization_id: int
    name: str
    description: Optional[str] = None


class SectorCreate(BaseModel):
    name: str
    sector_type: str = "STANDARD"
    is_numbered: bool = True
    base_price: float = 0
    currency: str = "EUR"
    capacity: Optional[int] = None
    color: Optional[str] = None
    sort_order: int = 0


class RowCreate(BaseModel):
    label: str
    sort_order: int = 0
    seats_count: int = 10
    start_number: int = 1


class ReserveRequest(BaseModel):
    seat_ids: List[int]
    idempotency_key: Optional[str] = None


async def _get_seat_map_for_org(db: AsyncSession, seat_map_id: int, user: User) -> SeatMap:
    sm = await db.get(SeatMap, seat_map_id)
    if not sm:
        raise HTTPException(404, "Seat map not found")
    if user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        member = await db.execute(
            select(OrganizationMember).where(
                OrganizationMember.organization_id == sm.organization_id,
                OrganizationMember.user_id == user.id,
            )
        )
        if not member.scalar_one_or_none():
            raise HTTPException(403, "Not a member of this organization")
    return sm


@router.post("")
async def create_seat_map(data: SeatMapCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        await get_org_member(data.organization_id, user, db)
    event = await db.get(Event, data.event_id)
    if not event or event.organization_id != data.organization_id:
        raise HTTPException(400, "Event not found or does not belong to organization")
    sm = SeatMap(
        event_id=data.event_id,
        organization_id=data.organization_id,
        name=data.name,
        description=data.description,
    )
    db.add(sm)
    await db.commit()
    await db.refresh(sm)
    await log_audit(db, user.id, "seat_map.created", "SeatMap", sm.id, {"event_id": data.event_id})
    return {"id": sm.id, "name": sm.name, "event_id": sm.event_id}


@router.get("/event/{event_id}")
async def get_seat_map_for_event(event_id: int, db: AsyncSession = Depends(get_db)):
    """Public: return active seat map structure with seat statuses."""
    result = await db.execute(
        select(SeatMap).where(SeatMap.event_id == event_id, SeatMap.is_active == True)
    )
    sm = result.scalar_one_or_none()
    if not sm:
        return {"seat_map": None}
    return await _seat_map_payload(db, sm)


async def _seat_map_payload(db: AsyncSession, sm: SeatMap):
    sectors_result = await db.execute(select(Sector).where(Sector.seat_map_id == sm.id).order_by(Sector.sort_order))
    sectors = sectors_result.scalars().all()
    sectors_out = []
    for sector in sectors:
        rows_result = await db.execute(select(SeatRow).where(SeatRow.sector_id == sector.id).order_by(SeatRow.sort_order))
        rows = rows_result.scalars().all()
        rows_out = []
        for row in rows:
            seats_result = await db.execute(select(Seat).where(Seat.row_id == row.id))
            seats = seats_result.scalars().all()
            seats_out = []
            for seat in seats:
                price = float(seat.price_override) if seat.price_override is not None else float(sector.base_price)
                seats_out.append({
                    "id": seat.id,
                    "number": seat.number,
                    "status": seat.status,
                    "price": price,
                    "x": seat.x,
                    "y": seat.y,
                })
            rows_out.append({"id": row.id, "label": row.label, "seats": seats_out})
        sectors_out.append({
            "id": sector.id,
            "name": sector.name,
            "sector_type": sector.sector_type,
            "is_numbered": sector.is_numbered,
            "base_price": float(sector.base_price),
            "currency": sector.currency,
            "capacity": sector.capacity,
            "color": sector.color,
            "rows": rows_out,
        })
    free = sum(1 for s in sectors_out for r in s["rows"] for seat in r["seats"] if seat["status"] == "FREE")
    total = sum(1 for s in sectors_out for r in s["rows"] for _ in r["seats"])
    return {
        "id": sm.id,
        "name": sm.name,
        "event_id": sm.event_id,
        "organization_id": sm.organization_id,
        "sectors": sectors_out,
        "stats": {"total": total, "free": free, "occupied": total - free},
    }


@router.get("/{seat_map_id}")
async def get_seat_map(seat_map_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    sm = await _get_seat_map_for_org(db, seat_map_id, user)
    return await _seat_map_payload(db, sm)


@router.post("/{seat_map_id}/sectors")
async def add_sector(seat_map_id: int, data: SectorCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    sm = await _get_seat_map_for_org(db, seat_map_id, user)
    sector = Sector(
        seat_map_id=sm.id,
        name=data.name,
        sector_type=data.sector_type,
        is_numbered=data.is_numbered,
        base_price=data.base_price,
        currency=data.currency,
        capacity=data.capacity,
        color=data.color,
        sort_order=data.sort_order,
    )
    db.add(sector)
    await db.commit()
    await db.refresh(sector)
    await log_audit(db, user.id, "sector.created", "Sector", sector.id, {"seat_map_id": sm.id})
    return {"id": sector.id, "name": sector.name}


@router.post("/sectors/{sector_id}/rows")
async def add_row(sector_id: int, data: RowCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    sector = await db.get(Sector, sector_id)
    if not sector:
        raise HTTPException(404, "Sector not found")
    sm = await _get_seat_map_for_org(db, sector.seat_map_id, user)
    row = SeatRow(sector_id=sector.id, label=data.label, sort_order=data.sort_order)
    db.add(row)
    await db.flush()
    if sector.is_numbered and data.seats_count > 0:
        for i in range(data.seats_count):
            seat = Seat(row_id=row.id, number=str(data.start_number + i), status="FREE")
            db.add(seat)
    await db.commit()
    await db.refresh(row)
    await log_audit(db, user.id, "seat_row.created", "SeatRow", row.id, {"sector_id": sector.id, "seats": data.seats_count})
    return {"id": row.id, "label": row.label, "seats_created": data.seats_count if sector.is_numbered else 0}


@router.post("/reserve")
async def reserve_seats(
    data: ReserveRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    idempotency_key: Optional[str] = Header(None, alias="X-Idempotency-Key"),
):
    """Atomically reserve seats. Uses SELECT FOR UPDATE to prevent double booking."""
    key = data.idempotency_key or idempotency_key
    if key:
        existing = await db.execute(
            select(SeatReservation).where(SeatReservation.idempotency_key == key)
        )
        prev = existing.scalars().all()
        if prev:
            return {"status": "ok", "reservation_ids": [r.id for r in prev], "idempotent": True}

    # Lock seats
    result = await db.execute(
        select(Seat).where(Seat.id.in_(data.seat_ids)).with_for_update()
    )
    seats = result.scalars().all()
    if len(seats) != len(set(data.seat_ids)):
        raise HTTPException(400, "One or more seats not found")

    # Expire old active reservations for these seats
    now = datetime.utcnow()
    for i, seat in enumerate(seats):
        if seat.status == "SOLD":
            raise HTTPException(409, f"Seat {seat.id} is already sold")
        # Check active non-expired reservation
        active = await db.execute(
            select(SeatReservation).where(
                SeatReservation.seat_id == seat.id,
                SeatReservation.status == "ACTIVE",
                SeatReservation.expires_at > now,
            )
        )
        if active.scalar_one_or_none():
            raise HTTPException(409, f"Seat {seat.id} is currently reserved")

    reservation_ids = []
    for i, seat in enumerate(seats):
        seat.status = "RESERVED"
        res = SeatReservation(
            seat_id=seat.id,
            user_id=user.id,
            status="ACTIVE",
            expires_at=SeatReservation.default_expiry(),
            idempotency_key=key if i == 0 else None,
        )
        db.add(res)
        await db.flush()
        reservation_ids.append(res.id)

    await db.commit()
    return {"status": "ok", "reservation_ids": reservation_ids, "expires_in_minutes": 15}


@router.post("/reservations/{reservation_id}/release")
async def release_reservation(reservation_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.get(SeatReservation, reservation_id)
    if not res or res.user_id != user.id:
        raise HTTPException(404, "Reservation not found")
    if res.status != "ACTIVE":
        return {"status": res.status}
    seat = await db.get(Seat, res.seat_id)
    if seat and seat.status == "RESERVED":
        seat.status = "FREE"
    res.status = "RELEASED"
    await db.commit()
    return {"status": "released"}


@router.post("/internal/expire-seat-reservations")
async def expire_seat_reservations(
    x_internal_job: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """Release expired active seat reservations. Protected by internal header. Uses FOR UPDATE."""
    from app.config import INTERNAL_API_SECRET
    if not INTERNAL_API_SECRET or x_internal_job != INTERNAL_API_SECRET:
        raise HTTPException(403, "Internal job only")
    now = datetime.utcnow()
    result = await db.execute(
        select(SeatReservation).where(
            SeatReservation.status == "ACTIVE",
            SeatReservation.expires_at <= now,
        ).with_for_update(skip_locked=True)
    )
    expired = result.scalars().all()
    count = 0
    for res in expired:
        if res.status != "ACTIVE":
            continue
        seat = await db.get(Seat, res.seat_id)
        if seat and seat.status == "RESERVED":
            locked = await db.execute(select(Seat).where(Seat.id == seat.id).with_for_update())
            seat = locked.scalar_one()
            seat.status = "FREE"
        res.status = "EXPIRED"
        count += 1
    await db.commit()
    return {"expired": count}


@admin_router.get("")
async def admin_list_seat_maps(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    user: User = Depends(require_role(*ADMIN_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    total = await db.scalar(select(func.count(SeatMap.id)))
    result = await db.execute(
        select(SeatMap).order_by(SeatMap.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    )
    maps = result.scalars().all()
    return {
        "total": total or 0,
        "items": [{"id": m.id, "name": m.name, "event_id": m.event_id, "organization_id": m.organization_id, "is_active": m.is_active} for m in maps],
    }


@admin_router.get("/{seat_map_id}")
async def admin_get_seat_map(seat_map_id: int, user: User = Depends(require_role(*ADMIN_ROLES)), db: AsyncSession = Depends(get_db)):
    sm = await db.get(SeatMap, seat_map_id)
    if not sm:
        raise HTTPException(404, "Seat map not found")
    return await _seat_map_payload(db, sm)


class CheckoutRequest(BaseModel):
    seat_ids: List[int]
    idempotency_key: Optional[str] = None


@router.post("/checkout")
async def seat_checkout(data: CheckoutRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Create an Order from active seat reservations and link them.
    Uses existing Order/OrderItem. Inventory is reserved against a seat-map ticket type.
    """
    from app.models.order import Order, OrderItem, OrderStatus
    from app.models.ticket import TicketType
    from app.models.inventory import TicketInventory
    import uuid
    from datetime import timedelta

    now = datetime.utcnow()
    # Lock seats
    result = await db.execute(select(Seat).where(Seat.id.in_(data.seat_ids)).with_for_update())
    seats = result.scalars().all()
    if len(seats) != len(set(data.seat_ids)):
        raise HTTPException(400, "One or more seats not found")

    # Verify active reservations owned by user
    res_result = await db.execute(
        select(SeatReservation).where(
            SeatReservation.seat_id.in_(data.seat_ids),
            SeatReservation.user_id == user.id,
            SeatReservation.status == "ACTIVE",
            SeatReservation.expires_at > now,
        )
    )
    reservations = res_result.scalars().all()
    if len(reservations) != len(seats):
        raise HTTPException(409, "Seats must be actively reserved by you and not expired")

    # Determine event from first seat
    first = seats[0]
    row = await db.get(SeatRow, first.row_id)
    sector = await db.get(Sector, row.sector_id)
    sm = await db.get(SeatMap, sector.seat_map_id)
    event = await db.get(Event, sm.event_id)

    # Ensure a ticket type exists for this event (seat map)
    tt_result = await db.execute(
        select(TicketType).where(TicketType.event_id == event.id, TicketType.name == "Seat Map")
    )
    tt = tt_result.scalar_one_or_none()
    if not tt:
        tt = TicketType(
            event_id=event.id,
            name="Seat Map",
            price=0,
            currency="EUR",
            quantity_total=100000,
            quantity_sold=0,
            quantity_reserved=0,
            is_active=True,
        )
        db.add(tt)
        await db.flush()
        inv = TicketInventory(ticket_type_id=tt.id, available=100000, reserved=0, sold=0, version=1)
        db.add(inv)
        await db.flush()
    else:
        inv = await db.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == tt.id).with_for_update())
        inv = inv.scalar_one()

    # Create order
    total = sum(float(s.price_override) if s.price_override is not None else float(sector.base_price) for s in seats)
    order = Order(
        user_id=user.id,
        status=OrderStatus.RESERVED.value,
        total_amount=total,
        currency="EUR",
        reference=f"BE-{uuid.uuid4().hex[:10].upper()}",
        reserved_until=now + timedelta(minutes=15),
        idempotency_key=data.idempotency_key,
    )
    db.add(order)
    await db.flush()

    # One order item for all seats (quantity = number of seats)
    oi = OrderItem(order_id=order.id, ticket_type_id=tt.id, quantity=len(seats), unit_price=total / len(seats) if seats else 0)
    db.add(oi)
    inv.available -= len(seats)
    inv.reserved += len(seats)
    inv.version += 1

    # Link reservations
    for res in reservations:
        res.order_id = order.id

    await db.commit()
    await db.refresh(order)
    return {"order_id": order.id, "reference": order.reference, "total": total, "seat_ids": data.seat_ids}
