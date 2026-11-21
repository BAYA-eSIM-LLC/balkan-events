"""Add PostgreSQL trigger to prevent UPDATE/DELETE on ledger_entries

Revision ID: 003
Revises: 002
"""
from alembic import op

revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None

def upgrade():
    op.execute("""
        CREATE OR REPLACE FUNCTION prevent_ledger_modification()
        RETURNS TRIGGER AS $$
        BEGIN
            RAISE EXCEPTION 'LedgerEntry records are immutable. UPDATE and DELETE are forbidden.';
        END;
        $$ LANGUAGE plpgsql;
    """)
    op.execute("""
        CREATE TRIGGER trg_ledger_entries_immutable
            BEFORE UPDATE OR DELETE ON ledger_entries
            FOR EACH ROW
            EXECUTE FUNCTION prevent_ledger_modification();
    """)

def downgrade():
    op.execute("DROP TRIGGER IF EXISTS trg_ledger_entries_immutable ON ledger_entries;")
    op.execute("DROP FUNCTION IF EXISTS prevent_ledger_modification();")
