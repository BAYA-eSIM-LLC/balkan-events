import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.ledger import LedgerEntry
from sqlalchemy import select, text

@pytest.mark.asyncio
async def test_repeated_requests_idempotency(db_session: AsyncSession):
    await db_session.execute(text("INSERT INTO organizations (id, name, slug) VALUES (901, 'Idem Org', 'idem') ON CONFLICT DO NOTHING"))
    await db_session.commit()

    key = "repeat-key-xyz"
    for i in range(3):
        entry = LedgerEntry(
            entry_type="sale",
            organization_id=901,
            amount=25.00,
            description=f"Attempt {i}",
            idempotency_key=key
        )
        db_session.add(entry)
        try:
            await db_session.commit()
        except Exception:
            await db_session.rollback()

    result = await db_session.execute(select(LedgerEntry).where(LedgerEntry.idempotency_key == key))
    entries = result.scalars().all()
    assert len(entries) == 1
