import pytest
import asyncio
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.inventory import reserve_tickets, release_reservation, confirm_sale
from app.models.inventory import TicketInventory
from app.models.reservation import Reservation
from fastapi import HTTPException

@pytest.mark.asyncio
async def test_reserve_release_confirm(db_session: AsyncSession):
    # Seed minimal data
    await db_session.execute(text("""
        INSERT INTO organizations (id, name, slug) VALUES (100, 'Inv Org', 'inv-org') ON CONFLICT DO NOTHING;
        INSERT INTO users (id, email, password_hash, full_name, role) VALUES (100, 'invuser@test.com', 'hash', 'Inv User', 'USER') ON CONFLICT DO NOTHING;
        INSERT INTO events (id, organization_id, title, slug, start_at, is_published)
        VALUES (100, 100, 'Inv Event', 'inv-event', NOW() + INTERVAL '1 day', true) ON CONFLICT DO NOTHING;
        INSERT INTO ticket_types (id, event_id, name, price, quantity_total)
        VALUES (100, 100, 'VIP', 25.00, 10) ON CONFLICT DO NOTHING;
        INSERT INTO ticket_inventory (ticket_type_id, available, reserved, sold)
        VALUES (100, 10, 0, 0) ON CONFLICT (ticket_type_id) DO UPDATE SET available = 10, reserved = 0, sold = 0;
    """))
    await db_session.commit()

    # Reserve
    res = await reserve_tickets(db_session, 100, 100, 2)
    assert res.quantity == 2
    assert res.status == "active"

    inv = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 100))).scalar_one()
    assert inv.available == 8
    assert inv.reserved == 2

    # Release
    await release_reservation(db_session, res.id)
    inv = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 100))).scalar_one()
    assert inv.available == 10
    assert inv.reserved == 0

    # Reserve again and confirm
    res2 = await reserve_tickets(db_session, 100, 100, 3)
    await confirm_sale(db_session, res2.id)
    inv = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 100))).scalar_one()
    assert inv.available == 7
    assert inv.reserved == 0
    assert inv.sold == 3

@pytest.mark.asyncio
async def test_prevent_negative_inventory(db_session: AsyncSession):
    await db_session.execute(text("""
        INSERT INTO ticket_inventory (ticket_type_id, available, reserved, sold)
        VALUES (100, 1, 0, 0) ON CONFLICT (ticket_type_id) DO UPDATE SET available = 1, reserved = 0, sold = 0;
    """))
    await db_session.commit()

    with pytest.raises(HTTPException) as exc:
        await reserve_tickets(db_session, 100, 100, 5)
    assert exc.value.status_code == 409

    inv = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 100))).scalar_one()
    assert inv.available == 1

@pytest.mark.asyncio
async def test_concurrent_last_5_tickets():
    """20 concurrent requests for last 5 tickets. Exactly 5 succeed."""
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
    import os
    DATABASE_URL = os.getenv("DATABASE_URL")
    eng = create_async_engine(DATABASE_URL)
    Session = async_sessionmaker(eng, expire_on_commit=False)

    # Seed
    async with Session() as s:
        await s.execute(text("""
            INSERT INTO organizations (id, name, slug) VALUES (200, 'Conc Org', 'conc-org') ON CONFLICT DO NOTHING;
            INSERT INTO users (id, email, password_hash, full_name, role) VALUES (200, 'conc@test.com', 'hash', 'Conc User', 'USER') ON CONFLICT DO NOTHING;
            INSERT INTO events (id, organization_id, title, slug, start_at, is_published)
            VALUES (200, 200, 'Conc Event', 'conc-event', NOW() + INTERVAL '1 day', true) ON CONFLICT DO NOTHING;
            INSERT INTO ticket_types (id, event_id, name, price, quantity_total)
            VALUES (200, 200, 'Last', 10.00, 5) ON CONFLICT DO NOTHING;
            INSERT INTO ticket_inventory (ticket_type_id, available, reserved, sold)
            VALUES (200, 5, 0, 0) ON CONFLICT (ticket_type_id) DO UPDATE SET available = 5, reserved = 0, sold = 0;
        """))
        await s.commit()

    async def attempt(i: int):
        async with Session() as session:
            try:
                await reserve_tickets(session, 200, 200, 1)
                return True
            except HTTPException:
                return False
            except Exception:
                return False

    results = await asyncio.gather(*[attempt(i) for i in range(20)])
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
