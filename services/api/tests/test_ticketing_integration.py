"""Real integration tests for Ticketing Core (PostgreSQL + HTTP API).
These hit the FastAPI endpoints and the database.
"""
import pytest
import asyncio
import os
from httpx import AsyncClient
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.inventory import TicketInventory
from app.models.order import Order, OrderStatus
from app.models.ticket import Ticket

INTERNAL = os.getenv("INTERNAL_API_SECRET", "ci-internal-secret")

async def seed_event(session: AsyncSession, base: int, qty: int = 1):
    stmts = [
        f"INSERT INTO organizations (id, name, slug) VALUES ({base}, 'Org{base}', 'org-{base}') ON CONFLICT DO NOTHING",
        f"INSERT INTO users (id, email, password_hash, full_name, role) VALUES ({base}, 'u{base}@t.com', 'h', 'U{base}', 'user') ON CONFLICT DO NOTHING",
        f"INSERT INTO events (id, organization_id, title, slug, start_at, is_published, status) VALUES ({base}, {base}, 'E{base}', 'e-{base}', NOW() + INTERVAL '1 day', true, 'PUBLISHED') ON CONFLICT DO NOTHING",
        f"INSERT INTO ticket_types (id, event_id, name, price, quantity_total) VALUES ({base}, {base}, 'T', 10.00, {qty}) ON CONFLICT DO NOTHING",
        f"INSERT INTO ticket_inventory (ticket_type_id, available, reserved, sold) VALUES ({base}, {qty}, 0, 0) ON CONFLICT (ticket_type_id) DO UPDATE SET available = {qty}, reserved = 0, sold = 0",
    ]
    for s in stmts:
        await session.execute(text(s))
    await session.commit()

async def get_token(client: AsyncClient, email: str) -> str:
    # Register or login
    r = await client.post("/auth/register", json={"email": email, "password": "pass123456", "full_name": "Test"})
    if r.status_code != 200:
        r = await client.post("/auth/login", json={"email": email, "password": "pass123456"})
    return r.json()["access_token"]

@pytest.mark.asyncio
async def test_concurrent_last_ticket_api(client: AsyncClient, db_session: AsyncSession):
    """Two concurrent purchases of the last ticket – only one succeeds."""
    await seed_event(db_session, 9101, 1)
    t1 = await get_token(client, "buyer1-9101@t.com")
    t2 = await get_token(client, "buyer2-9101@t.com")

    async def buy(token):
        return await client.post(
            "/orders",
            json={"items": [{"ticket_type_id": 9101, "quantity": 1}]},
            headers={"Authorization": f"Bearer {token}"},
        )

    r1, r2 = await asyncio.gather(buy(t1), buy(t2))
    codes = sorted([r1.status_code, r2.status_code])
    assert codes == [200, 400]  # one success, one insufficient
    inv = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 9101))).scalar_one()
    assert inv.available == 0
    assert inv.reserved == 1
    assert inv.sold == 0
    assert inv.available >= 0

@pytest.mark.asyncio
async def test_idempotency_same_key(client: AsyncClient, db_session: AsyncSession):
    """Repeated request with same idempotency key returns the same order."""
    await seed_event(db_session, 9102, 5)
    token = await get_token(client, "idem-9102@t.com")
    key = "idem-key-9102"
    body = {"items": [{"ticket_type_id": 9102, "quantity": 2}], "idempotency_key": key}
    r1 = await client.post("/orders", json=body, headers={"Authorization": f"Bearer {token}"})
    r2 = await client.post("/orders", json=body, headers={"Authorization": f"Bearer {token}"})
    assert r1.status_code == 200
    assert r2.status_code == 200
    assert r1.json()["id"] == r2.json()["id"]
    assert r1.json()["reference"] == r2.json()["reference"]
    inv = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 9102))).scalar_one()
    assert inv.reserved == 2  # only reserved once

@pytest.mark.asyncio
async def test_idempotency_different_content(client: AsyncClient, db_session: AsyncSession):
    """Same key with different content returns 409."""
    await seed_event(db_session, 9103, 5)
    token = await get_token(client, "idem-diff-9103@t.com")
    key = "idem-diff-9103"
    r1 = await client.post(
        "/orders",
        json={"items": [{"ticket_type_id": 9103, "quantity": 1}], "idempotency_key": key},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r1.status_code == 200
    r2 = await client.post(
        "/orders",
        json={"items": [{"ticket_type_id": 9103, "quantity": 2}], "idempotency_key": key},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r2.status_code == 409

@pytest.mark.asyncio
async def test_concurrent_expire_and_confirm(client: AsyncClient, db_session: AsyncSession):
    """Concurrent expire and confirm on the same order – exactly one succeeds."""
    await seed_event(db_session, 9104, 5)
    token = await get_token(client, "exp-conf-9104@t.com")
    r = await client.post(
        "/orders",
        json={"items": [{"ticket_type_id": 9104, "quantity": 1}]},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    order_id = r.json()["id"]
    # Force expiry
    await db_session.execute(text("UPDATE orders SET reserved_until = NOW() - INTERVAL '1 minute' WHERE id = :id"), {"id": order_id})
    await db_session.commit()

    async def do_confirm():
        return await client.post(
            f"/orders/{order_id}/confirm",
            headers={"Authorization": f"Bearer {token}", "X-Internal-Confirm": INTERNAL},
        )

    async def do_expire():
        return await client.post(
            "/orders/internal/expire-reservations",
            headers={"X-Internal-Job": INTERNAL},
        )

    c, e = await asyncio.gather(do_confirm(), do_expire())
    # One of them should succeed in changing state; the other should see non-reserved
    statuses = {c.status_code, e.status_code}
    assert 200 in statuses
    order = await db_session.get(Order, order_id)
    assert order.status in (OrderStatus.PAID, OrderStatus.EXPIRED)
    inv = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 9104))).scalar_one()
    assert inv.available + inv.reserved + inv.sold == 5
    assert inv.available >= 0 and inv.reserved >= 0 and inv.sold >= 0

@pytest.mark.asyncio
async def test_double_qr_scan(client: AsyncClient, db_session: AsyncSession):
    """Scanning the same QR ticket twice returns ALREADY_USED."""
    await seed_event(db_session, 9105, 2)
    token = await get_token(client, "scan-9105@t.com")
    r = await client.post(
        "/orders",
        json={"items": [{"ticket_type_id": 9105, "quantity": 1}]},
        headers={"Authorization": f"Bearer {token}"},
    )
    order_id = r.json()["id"]
    conf = await client.post(
        f"/orders/{order_id}/confirm",
        headers={"Authorization": f"Bearer {token}", "X-Internal-Confirm": INTERNAL},
    )
    assert conf.status_code == 200
    ticket = (await db_session.execute(select(Ticket).where(Ticket.order_item_id.isnot(None)))).scalars().first()
    # Get the ticket we just created
    tickets = (await db_session.execute(select(Ticket))).scalars().all()
    qr = tickets[-1].qr_data

    s1 = await client.post(
        "/scanner/validate",
        json={"qr_data": qr, "event_id": 9105},
        headers={"Authorization": f"Bearer {token}"},
    )
    s2 = await client.post(
        "/scanner/validate",
        json={"qr_data": qr, "event_id": 9105},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert s1.json()["status"] == "VALID"
    assert s2.json()["status"] == "ALREADY_USED"
    # No second ticket issued
    count = (await db_session.execute(select(Ticket).where(Ticket.qr_data == qr))).scalars().all()
    assert len(count) == 1

@pytest.mark.asyncio
async def test_expired_reservation_auto_release(client: AsyncClient, db_session: AsyncSession):
    """Automatic release of expired reservation restores inventory."""
    await seed_event(db_session, 9106, 10)
    token = await get_token(client, "expire-9106@t.com")
    r = await client.post(
        "/orders",
        json={"items": [{"ticket_type_id": 9106, "quantity": 3}]},
        headers={"Authorization": f"Bearer {token}"},
    )
    order_id = r.json()["id"]
    await db_session.execute(text("UPDATE orders SET reserved_until = NOW() - INTERVAL '1 minute' WHERE id = :id"), {"id": order_id})
    await db_session.commit()

    exp = await client.post(
        "/orders/internal/expire-reservations",
        headers={"X-Internal-Job": INTERNAL},
    )
    assert exp.status_code == 200
    inv = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 9106))).scalar_one()
    assert inv.available == 10
    assert inv.reserved == 0
    order = await db_session.get(Order, order_id)
    assert order.status == OrderStatus.EXPIRED

@pytest.mark.asyncio
async def test_no_negative_inventory_or_double_qr(client: AsyncClient, db_session: AsyncSession):
    """Confirm inventory never goes negative and QR is issued only once."""
    await seed_event(db_session, 9107, 1)
    token = await get_token(client, "neg-9107@t.com")
    r = await client.post(
        "/orders",
        json={"items": [{"ticket_type_id": 9107, "quantity": 1}]},
        headers={"Authorization": f"Bearer {token}"},
    )
    order_id = r.json()["id"]
    conf1 = await client.post(
        f"/orders/{order_id}/confirm",
        headers={"Authorization": f"Bearer {token}", "X-Internal-Confirm": INTERNAL},
    )
    conf2 = await client.post(
        f"/orders/{order_id}/confirm",
        headers={"Authorization": f"Bearer {token}", "X-Internal-Confirm": INTERNAL},
    )
    assert conf1.status_code == 200
    assert conf2.status_code == 400  # not reserved anymore
    inv = (await db_session.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == 9107))).scalar_one()
    assert inv.sold == 1
    assert inv.reserved == 0
    assert inv.available == 0
    tickets = (await db_session.execute(select(Ticket).where(Ticket.ticket_type_id == 9107))).scalars().all()
    assert len(tickets) == 1
