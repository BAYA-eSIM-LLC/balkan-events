"""Scanner device tokens

Revision ID: 023_scanner_tokens
Revises: 022_discovery
Create Date: 2026-11-23
"""
from alembic import op
import sqlalchemy as sa

revision = '023_scanner_tokens'
down_revision = '022_discovery'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('scanner_device_tokens',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('device_id', sa.Integer(), sa.ForeignKey('scanner_devices.id'), nullable=False),
        sa.Column('token_hash', sa.String(64), unique=True, nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('last_used_at', sa.DateTime()),
        sa.Column('revoked_at', sa.DateTime()),
    )
    op.create_index('ix_device_tokens_device', 'scanner_device_tokens', ['device_id'])


def downgrade():
    op.drop_index('ix_device_tokens_device', table_name='scanner_device_tokens')
    op.drop_table('scanner_device_tokens')
