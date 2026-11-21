import pytest
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.ledger import LedgerEntry

@pytest.mark.asyncio
async def test_ledger_insert_still_works(db_session: AsyncSession):
    await db_session.execute(text("INSERT INTO organizations (id, name, slug) VALUES (500, 'Imm Org', 'imm-org') ON CONFLICT DO NOTHING"))
    await db_session.commit()

    entry = LedgerEntry(
        entry_type="sale",
        reference_type="order",
        reference_id=999,
        organization_id=500,
        amount=50.00,
        description="Valid insert",
        idempotency_key="imm-test-001"
    )
    db_session.add(entry)
    await db_session.commit()

    result = await db_session.execute(select(LedgerEntry).where(LedgerEntry.idempotency_key == "imm-test-001"))
    assert result.scalar_one_or_none() is not None

@pytest.mark.asyncio
async def test_ledger_update_blocked(db_session: AsyncSession):
    await db_session.execute(text("INSERT INTO organizations (id, name, slug) VALUES (501, 'Imm Org2', 'imm-org2') ON CONFLICT DO NOTHING"))
    await db_session.commit()

    entry = LedgerEntry(
        entry_type="sale",
        reference_type="order",
        reference_id=1000,
        organization_id=501,
        amount=75.00,
        description="To be protected",
        idempotency_key="imm-test-002"
    )
    db_session.add(entry)
    await db_session.commit()
    entry_id = entry.id

    raised = False
    try:
        await db_session.execute(
            text("UPDATE ledger_entries SET amount = 999 WHERE id = :id"),
            {"id": entry_id}
        )
        await db_session.commit()
    except Exception as e:
        raised = True
        await db_session.rollback()
        assert "immutable" in str(e).lower() or "forbidden" in str(e).lower()

    assert raised, "UPDATE should have been blocked by trigger"

@pytest.mark.asyncio
async def test_ledger_delete_blocked(db_session: AsyncSession):
    await db_session.execute(text("INSERT INTO organizations (id, name, slug) VALUES (502, 'Imm Org3', 'imm-org3') ON CONFLICT DO NOTHING"))
    await db_session.commit()

    entry = LedgerEntry(
        entry_type="sale",
        reference_type="order",
        reference_id=1001,
        organization_id=502,
        amount=25.00,
        description="To be protected from delete",
        idempotency_key="imm-test-003"
    )
    db_session.add(entry)
    await db_session.commit()
    entry_id = entry.id

    raised = False
    try:
        await db_session.execute(
            text("DELETE FROM ledger_entries WHERE id = :id"),
            {"id": entry_id}
        )
        await db_session.commit()
    except Exception as e:
        raised = True
        await db_session.rollback()
        assert "immutable" in str(e).lower() or "forbidden" in str(e).lower()

    assert raised, "DELETE should have been blocked by trigger"

    # Confirm the record still exists after rollback
    result = await db_session.execute(select(LedgerEntry).where(LedgerEntry.id == entry_id))
    assert result.scalar_one_or_none() is not None
