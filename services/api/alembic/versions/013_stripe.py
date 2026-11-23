"""Stripe fields and webhook idempotency

Revision ID: 013_stripe
Revises: 012_content_hash
Create Date: 2026-11-23
"""
from alembic import op
import sqlalchemy as sa

revision = '013_stripe'
down_revision = '012_content_hash'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('payments', sa.Column('stripe_session_id', sa.String(255), unique=True))
    op.add_column('payments', sa.Column('stripe_fee', sa.Numeric(10, 2)))
    op.add_column('payments', sa.Column('platform_fee', sa.Numeric(10, 2)))
    op.add_column('refunds', sa.Column('stripe_refund_id', sa.String(255), unique=True))
    op.create_table('stripe_events',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('event_id', sa.String(255), unique=True, nullable=False),
        sa.Column('event_type', sa.String(100)),
        sa.Column('processed_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('success', sa.Boolean(), default=True)
    )

def downgrade():
    op.drop_table('stripe_events')
    op.drop_column('refunds', 'stripe_refund_id')
    op.drop_column('payments', 'platform_fee')
    op.drop_column('payments', 'stripe_fee')
    op.drop_column('payments', 'stripe_session_id')
