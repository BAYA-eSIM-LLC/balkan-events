"""Add content_hash for idempotency

Revision ID: 012_content_hash
Revises: 011_order_ref
Create Date: 2026-11-23
"""
from alembic import op
import sqlalchemy as sa

revision = '012_content_hash'
down_revision = '011_order_ref'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('orders', sa.Column('content_hash', sa.String(32)))

def downgrade():
    op.drop_column('orders', 'content_hash')
