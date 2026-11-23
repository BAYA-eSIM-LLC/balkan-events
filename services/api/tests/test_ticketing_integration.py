"""Real integration tests for Ticketing Core (PostgreSQL).
These hit the database and inventory service.
"""
import pytest
import asyncio
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.inventory import reserve_tickets, release_reservation, confirm_sale, release_expired_reservations
from app.models.inventory import TicketInventory
from app.models.reservation import Reservation
from fastapi import HTTPException
import os

DATABASE_URL = os.getenv("DATABASE_URL")

async def seed(session: AsyncSession, base: int, qty: int = 1):
    await session.execute(text(f"""
        INSERT INTO organizations (id, name, slug) VALUES ({base}, 'Org{base}', 'org-{base}') ON CONFLICT DO NOTHING;
        INSERT INTO users (id, email, password_hash, full_name) VALUES ({base}, 'u{base}@t.com', 'h', 'U{base}') ON CONFLICT DO NOTHING;
        INSERT INTO events (id, organization_id, title, slug, start_at, is_published)
            VALUES ({base}, {base}, 'E{base}', 'e-{base}', NOW() + INTERVAL '1 day', true) ON CONFLICT DO NOTHING;
        INSERT INTO ticket_types (id, event_id, name, price, quantity_total)
            VALUES ({base}, {base}, 'T', 10.00, {qty}) ON CONFLICT DO NOTHING;
        INSERT INTO ticket_inventory (ticket_type_id, available, reserved, sold)
            VALUES ({base}, {qty}, 0, 0) ON CONFLICT (ticket_type_id) DO UPDATE SET available = {qty}, reserved = 0, sold = 0;
    """))
    await session.commit()

@pytest.mark.asyncio
async def test_concurrent_last_ticket(db_session: AsyncSession):
    """Two concurrent buyers for the last ticket – only one succeeds."""
    await seed(db_session, 9001, 1)

    results = await asyncio.gather(
        reserve_tickets(db_session, 9001, 9001, 1),
        reserve_tickets(db_session, 9001, 9001, 1),
        return_exceptions=True,
    )
    successes = [r for r in results if not isinstance(r, Exception)]
    failures = [r for r in results if isinstance(r, Exception)]
    assert len(successes) == 1
    assert len(failures) == 1
    inv = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 9001))).scalar_one()
    assert inv.available == 0
    assert inv.reserved == 1
    assert inv.sold == 0
    assert inv.available >= 0 and inv.reserved >= 0 and inv.sold >= 0

@pytest.mark.asyncio
async def test_idempotency_same_content(db_session: AsyncSession):
    """Same reservation request twice – second should fail or be rejected by inventory."""
    await seed(db_session, 9002, 5)
    r1 = await reserve_tickets(db_session, 9002, 9002, 2)
    with pytest.raises(HTTPException):
        await reserve_tickets(db_session, 9002, 9002, 2)  # may succeed if separate reservations; inventory allows it
    # Force second identical active reservation to be rejected by releasing and re-checking logic
    # For this test we verify inventory never goes negative
    inv = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 9002))).scalar_one()
    assert inv.available >= 0
    assert inv.reserved >= 0

@pytest.mark.asyncio
async def test_expire_releases_inventory(db_session: AsyncSession):
    """Expired reservation is released exactly once."""
    await seed(db_session, 9003, 10)
    res = await reserve_tickets(db_session, 9003, 9003, 3)
    # Force expiry
    await db_session.execute(text("UPDATE reservations SET expires_at = NOW() - INTERVAL '1 minute' WHERE id = :id"), {"id": res.id})
    await db_session.commit()
    released = await release_expired_reservations(db_session)
    inv = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 9003))).scalar_one()
    assert inv.available == 10
    assert inv.reserved == 0
    # Second call does nothing
    released2 = await release_expired_reservations(db_session)
    inv2 = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 9003))).scalar_one()
    assert inv2.available == 10
    assert inv2.reserved == 0

@pytest.mark.asyncio
async def test_double_confirm_rejected(db_session: AsyncSession):
    """Confirming the same reservation twice fails."""
    await seed(db_session, 9004, 5)
    res = await reserve_tickets(db_session, 9004, 9004, 1)
    await confirm_sale(db_session, res.id)
    with pytest.raises(HTTPException) as exc:
        await confirm_sale(db_session, res.id)
    assert exc.value.status_code == 409
    inv = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 9004))).scalar_one()
    assert inv.sold == 1
    assert inv.reserved == 0
    assert inv.available == 4

@pytest.mark.asyncio
async def test_inventory_never_negative(db_session: AsyncSession):
    """Over-reserve is rejected and inventory stays non-negative."""
    await seed(db_session, 9005, 2)
    with pytest.raises(HTTPException):
        await reserve_tickets(db_session, 9005, 9005, 5)
    inv = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 9005))).scalar_one()
    assert inv.available == 2
    assert inv.reserved == 0
    assert inv.available >= 0
