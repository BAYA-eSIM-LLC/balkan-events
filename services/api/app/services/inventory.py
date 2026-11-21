from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.inventory import TicketInventory
from app.models.reservation import Reservation
from fastapi import HTTPException

async def reserve_tickets(db: AsyncSession, ticket_type_id: int, user_id: int, quantity: int) -> Reservation:
    result = await db.execute(
        select(TicketInventory).where(TicketInventory.ticket_type_id == ticket_type_id).with_for_update()
    )
    inv = result.scalar_one_or_none()
    if not inv or inv.available < quantity:
        raise HTTPException(status_code=409, detail="Insufficient inventory")
    inv.available -= quantity
    inv.reserved += quantity
    inv.version += 1
    reservation = Reservation(
        ticket_type_id=ticket_type_id,
        user_id=user_id,
        quantity=quantity,
        expires_at=Reservation.default_expiry()
    )
    db.add(reservation)
    await db.commit()
    return reservation

async def release_reservation(db: AsyncSession, reservation_id: int):
    result = await db.execute(select(Reservation).where(Reservation.id == reservation_id).with_for_update())
    res = result.scalar_one_or_none()
    if not res or res.status != "active":
        return
    inv_result = await db.execute(
        select(TicketInventory).where(TicketInventory.ticket_type_id == res.ticket_type_id).with_for_update()
    )
    inv = inv_result.scalar_one()
    inv.available += res.quantity
    inv.reserved -= res.quantity
    inv.version += 1
    res.status = "released"
    await db.commit()

async def confirm_sale(db: AsyncSession, reservation_id: int):
    result = await db.execute(select(Reservation).where(Reservation.id == reservation_id).with_for_update())
    res = result.scalar_one_or_none()
    if not res or res.status != "active":
        raise HTTPException(status_code=409, detail="Reservation not active")
    inv_result = await db.execute(
        select(TicketInventory).where(TicketInventory.ticket_type_id == res.ticket_type_id).with_for_update()
    )
    inv = inv_result.scalar_one()
    inv.reserved -= res.quantity
    inv.sold += res.quantity
    inv.version += 1
    res.status = "confirmed"
    await db.commit()
