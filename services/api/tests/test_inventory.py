import pytest
import asyncio
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.services.inventory import reserve_tickets, release_reservation, confirm_sale
from app.models.inventory import TicketInventory
from app.models.reservation import Reservation
from fastapi import HTTPException
import os

DATABASE_URL = os.getenv("DATABASE_URL")

async def seed_basic(session: AsyncSession, org_id: int, user_id: int, event_id: int, tt_id: int, qty: int):
    stmts = [
        f"INSERT INTO organizations (id, name, slug) VALUES ({org_id}, 'Org{org_id}', 'org-{org_id}') ON CONFLICT DO NOTHING",
        f"INSERT INTO users (id, email, password_hash, full_name, role) VALUES ({user_id}, 'user{user_id}@test.com', 'hash', 'User {user_id}', 'user') ON CONFLICT DO NOTHING",
        f"INSERT INTO events (id, organization_id, title, slug, start_at, is_published) VALUES ({event_id}, {org_id}, 'Event {event_id}', 'event-{event_id}', NOW() + INTERVAL '1 day', true) ON CONFLICT DO NOTHING",
        f"INSERT INTO ticket_types (id, event_id, name, price, quantity_total) VALUES ({tt_id}, {event_id}, 'Type', 10.00, {qty}) ON CONFLICT DO NOTHING",
        f"INSERT INTO ticket_inventory (ticket_type_id, available, reserved, sold) VALUES ({tt_id}, {qty}, 0, 0) ON CONFLICT (ticket_type_id) DO UPDATE SET available = {qty}, reserved = 0, sold = 0",
    ]
    for s in stmts:
        await session.execute(text(s))
    await session.commit()

@pytest.mark.asyncio
async def test_reserve_release_confirm(db_session: AsyncSession):
    await seed_basic(db_session, 100, 100, 100, 100, 10)

    res = await reserve_tickets(db_session, 100, 100, 2)
    assert res.quantity == 2
    assert res.status == "active"

    inv = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 100))).scalar_one()
    assert inv.available == 8
    assert inv.reserved == 2

    await release_reservation(db_session, res.id)
    inv = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 100))).scalar_one()
    assert inv.available == 10
    assert inv.reserved == 0

    res2 = await reserve_tickets(db_session, 100, 100, 3)
    await confirm_sale(db_session, res2.id)
    inv = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 100))).scalar_one()
    assert inv.available == 7
    assert inv.reserved == 0
    assert inv.sold == 3

@pytest.mark.asyncio
async def test_prevent_negative_inventory(db_session: AsyncSession):
    await seed_basic(db_session, 100, 100, 100, 100, 1)

    with pytest.raises(HTTPException) as exc:
        await reserve_tickets(db_session, 100, 100, 5)
    assert exc.value.status_code == 409

    inv = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 100))).scalar_one()
    assert inv.available == 1

@pytest.mark.asyncio
async def test_concurrent_last_5_tickets():
    eng = create_async_engine(DATABASE_URL)
    Session = async_sessionmaker(eng, expire_on_commit=False)

    async with Session() as s:
        await seed_basic(s, 200, 200, 200, 200, 5)

    async def attempt():
        async with Session() as session:
            try:
                await reserve_tickets(session, 200, 200, 1)
                return True
            except HTTPException:
                return False
            except Exception:
                return False

    results = await asyncio.gather(*[attempt() for _ in range(20)])
    successes = sum(1 for r in results if r)

    async with Session() as s:
        inv = (await s.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 200))).scalar_one()
        res_count = (await s.execute(select(Reservation).where(Reservation.ticket_type_id == 200, Reservation.status == "active"))).scalars().all()

    await eng.dispose()

    assert successes == 5, f"Expected 5 successes, got {successes}"
    assert inv.available == 0
    assert inv.reserved == 5
    assert inv.sold == 0
    assert len(res_count) == 5
    assert inv.available >= 0 and inv.reserved >= 0
