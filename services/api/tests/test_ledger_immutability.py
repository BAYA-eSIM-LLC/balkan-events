import pytest
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.ledger import LedgerEntry

@pytest.mark.asyncio
async def test_ledger_no_silent_modify_or_delete(db_session: AsyncSession):
    await db_session.execute(text("INSERT INTO organizations (id, name, slug) VALUES (900, 'Led2', 'led2') ON CONFLICT DO NOTHING"))
    await db_session.commit()

    key = "immutable-key-001"
    entry = LedgerEntry(
        entry_type="sale",
        reference_type="order",
        reference_id=99,
        organization_id=900,
        amount=50.00,
        description="Immutable test",
        idempotency_key=key
    )
    db_session.add(entry)
    await db_session.commit()
    await db_session.refresh(entry)
    original_id = entry.id

    # Trigger now blocks UPDATE
    entry.amount = 999
    raised = False
    try:
        await db_session.commit()
    except Exception as e:
        raised = True
        await db_session.rollback()
        assert "immutable" in str(e).lower() or "forbidden" in str(e).lower()

    assert raised, "ORM UPDATE should be blocked by PostgreSQL trigger"

    # Idempotency still holds
    dup = LedgerEntry(
        entry_type="sale",
        organization_id=900,
        amount=50.00,
        idempotency_key=key
    )
    db_session.add(dup)
    with pytest.raises(Exception):
        await db_session.commit()
    await db_session.rollback()

    final = (await db_session.execute(select(LedgerEntry).where(LedgerEntry.idempotency_key == key))).scalars().all()
    assert len(final) == 1
    assert final[0].id == original_id
