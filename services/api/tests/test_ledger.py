import pytest
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.ledger import LedgerEntry

@pytest.mark.asyncio
async def test_ledger_idempotency(db_session: AsyncSession):
    await db_session.execute(text("""
        INSERT INTO organizations (id, name, slug) VALUES (300, 'Led Org', 'led-org') ON CONFLICT DO NOTHING;
    """))
    await db_session.commit()

    key = "test-idem-key-001"
    entry1 = LedgerEntry(
        entry_type="sale",
        reference_type="order",
        reference_id=1,
        organization_id=300,
        amount=100.00,
        description="Test sale",
        idempotency_key=key
    )
    db_session.add(entry1)
    await db_session.commit()

    # Second insert with same key should fail unique constraint
    entry2 = LedgerEntry(
        entry_type="sale",
        reference_type="order",
        reference_id=1,
        organization_id=300,
        amount=100.00,
        description="Duplicate",
        idempotency_key=key
    )
    db_session.add(entry2)
    with pytest.raises(Exception):
        await db_session.commit()
    await db_session.rollback()

    result = await db_session.execute(select(LedgerEntry).where(LedgerEntry.idempotency_key == key))
    entries = result.scalars().all()
    assert len(entries) == 1
