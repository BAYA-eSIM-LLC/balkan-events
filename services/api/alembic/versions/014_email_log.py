"""Email logs for payment notifications

Revision ID: 014_email_log
Revises: 013_stripe
Create Date: 2026-11-23
"""
from alembic import op
import sqlalchemy as sa

revision = '014_email_log'
down_revision = '013_stripe'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('email_logs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('to_email', sa.String(255), nullable=False),
        sa.Column('subject', sa.String(255)),
        sa.Column('body', sa.Text()),
        sa.Column('template', sa.String(100)),
        sa.Column('reference_type', sa.String(50)),
        sa.Column('reference_id', sa.Integer()),
        sa.Column('idempotency_key', sa.String(100), unique=True),
        sa.Column('sent', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )

def downgrade():
    op.drop_table('email_logs')
