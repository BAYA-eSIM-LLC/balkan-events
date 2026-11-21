import pytest
from datetime import datetime, timedelta
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.inventory import reserve_tickets, release_reservation, confirm_sale, release_expired_reservations
from app.models.reservation import Reservation
from fastapi import HTTPException

@pytest.mark.asyncio
async def test_double_confirm_and_release(db_session: AsyncSession):
    await db_session.execute(text("INSERT INTO organizations (id, name, slug) VALUES (800, 'Res Org', 'res-org') ON CONFLICT DO NOTHING"))
    await db_session.execute(text("INSERT INTO users (id, email, password_hash, full_name) VALUES (800, 'resuser@test.com', 'h', 'Res') ON CONFLICT DO NOTHING"))
    await db_session.execute(text("INSERT INTO events (id, organization_id, title, slug, start_at, is_published) VALUES (800, 800, 'Res Event', 'res-event', NOW() + INTERVAL '1 day', true) ON CONFLICT DO NOTHING"))
    await db_session.execute(text("INSERT INTO ticket_types (id, event_id, name, price, quantity_total) VALUES (800, 800, 'T', 10, 10) ON CONFLICT DO NOTHING"))
    await db_session.execute(text("INSERT INTO ticket_inventory (ticket_type_id, available, reserved, sold) VALUES (800, 10, 0, 0) ON CONFLICT DO NOTHING"))
    await db_session.commit()

    res = await reserve_tickets(db_session, 800, 800, 2)

    await confirm_sale(db_session, res.id)
    with pytest.raises(HTTPException) as exc:
        await confirm_sale(db_session, res.id)
    assert exc.value.status_code == 409

    res2 = await reserve_tickets(db_session, 800, 800, 1)
    await release_reservation(db_session, res2.id)
    with pytest.raises(HTTPException) as exc2:
        await release_reservation(db_session, res2.id)
    assert exc2.value.status_code == 409

@pytest.mark.asyncio
async def test_expired_reservation_cleanup(db_session: AsyncSession):
    await db_session.execute(text("INSERT INTO organizations (id, name, slug) VALUES (801, 'Exp Org', 'exp-org') ON CONFLICT DO NOTHING"))
    await db_session.execute(text("INSERT INTO users (id, email, password_hash, full_name) VALUES (801, 'expuser@test.com', 'h', 'ExpU') ON CONFLICT DO NOTHING"))
    await db_session.execute(text("INSERT INTO events (id, organization_id, title, slug, start_at, is_published) VALUES (801, 801, 'Exp Event', 'exp-event', NOW() + INTERVAL '1 day', true) ON CONFLICT DO NOTHING"))
    await db_session.execute(text("INSERT INTO ticket_types (id, event_id, name, price, quantity_total) VALUES (801, 801, 'T', 10, 10) ON CONFLICT DO NOTHING"))
    await db_session.execute(text("INSERT INTO ticket_inventory (ticket_type_id, available, reserved, sold) VALUES (801, 5, 5, 0) ON CONFLICT DO NOTHING"))
    # Insert expired active reservation
    past = datetime.utcnow() - timedelta(minutes=30)
    await db_session.execute(text(f"INSERT INTO reservations (ticket_type_id, user_id, quantity, status, expires_at) VALUES (801, 801, 5, 'active', '{past.isoformat()}')"))
    await db_session.commit()

    released = await release_expired_reservations(db_session)
    assert released >= 1

    inv = (await db_session.execute(text("SELECT available, reserved FROM ticket_inventory WHERE ticket_type_id = 801"))).first()
    assert inv.available == 10
    assert inv.reserved == 0
