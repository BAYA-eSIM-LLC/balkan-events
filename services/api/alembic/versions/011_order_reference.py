"""Add order reference and idempotency key

Revision ID: 011_order_ref
Revises: 010_cms
Create Date: 2026-11-23
"""
from alembic import op
import sqlalchemy as sa

revision = '011_order_ref'
down_revision = '010_cms'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('orders', sa.Column('reference', sa.String(50), unique=True))
    op.add_column('orders', sa.Column('idempotency_key', sa.String(100), unique=True))

def downgrade():
    op.drop_column('orders', 'idempotency_key')
    op.drop_column('orders', 'reference')
