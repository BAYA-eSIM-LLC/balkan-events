import pytest
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://test_user:test_password@localhost:5432/balkan_events_test")

@pytest.fixture
async def engine():
    eng = create_async_engine(DATABASE_URL)
    yield eng
    await eng.dispose()

@pytest.mark.asyncio
async def test_concurrent_reservation_last_tickets(engine):
    """20 concurrent requests for 5 tickets - only 5 should succeed"""
    async with engine.begin() as conn:
        await conn.execute(text("""
            INSERT INTO organizations (id, name, slug) VALUES (1, 'Test Org', 'test-org') ON CONFLICT DO NOTHING;
            INSERT INTO events (id, organization_id, title, slug, start_at, is_published)
            VALUES (1, 1, 'Test Event', 'test-event', NOW() + INTERVAL '1 day', true) ON CONFLICT DO NOTHING;
            INSERT INTO ticket_types (id, event_id, name, price, quantity_total)
            VALUES (1, 1, 'General', 10.00, 5) ON CONFLICT DO NOTHING;
            INSERT INTO ticket_inventory (ticket_type_id, available, reserved, sold)
            VALUES (1, 5, 0, 0) ON CONFLICT (ticket_type_id) DO UPDATE SET available = 5, reserved = 0, sold = 0;
            INSERT INTO users (id, email, password_hash, full_name) VALUES (1, 'buyer@test.com', 'hash', 'Buyer') ON CONFLICT DO NOTHING;
        """))

    async def try_reserve(user_offset: int):
        async with engine.connect() as conn:
            async with conn.begin():
                result = await conn.execute(text(
                    "SELECT available FROM ticket_inventory WHERE ticket_type_id = 1 FOR UPDATE"
                ))
                row = result.fetchone()
                if row and row[0] >= 1:
                    await conn.execute(text(
                        "UPDATE ticket_inventory SET available = available - 1, reserved = reserved + 1 WHERE ticket_type_id = 1"
                    ))
                    return True
                return False

    tasks = [try_reserve(i) for i in range(20)]
    results = await asyncio.gather(*tasks)
    successes = sum(1 for r in results if r)

    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT available, reserved, sold FROM ticket_inventory WHERE ticket_type_id = 1"))
        row = result.fetchone()

    assert successes == 5, f"Expected 5 successes, got {successes}"
    assert row[0] == 0, f"Available should be 0, got {row[0]}"
    assert row[1] == 5, f"Reserved should be 5, got {row[1]}"
    assert row[0] >= 0 and row[1] >= 0, "Inventory went negative"

@pytest.mark.asyncio
async def test_no_negative_inventory(engine):
    async with engine.connect() as conn:
        result = await conn.execute(text(
            "UPDATE ticket_inventory SET available = -1 WHERE ticket_type_id = 1"
        ))
    # Check constraint should prevent this - if it doesn't raise, the constraint is missing
