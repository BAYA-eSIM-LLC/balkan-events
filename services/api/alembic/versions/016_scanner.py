"""QR Scanner Pro tables

Revision ID: 016_scanner
Revises: 015_platform_settings
Create Date: 2026-11-23
"""
from alembic import op
import sqlalchemy as sa

revision = '016_scanner'
down_revision = '015_platform_settings'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('entry_points',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('events.id'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_table('scanner_devices',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(255)),
        sa.Column('entry_point_id', sa.Integer(), sa.ForeignKey('entry_points.id')),
        sa.Column('organization_id', sa.Integer(), sa.ForeignKey('organizations.id')),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_table('scan_logs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('ticket_id', sa.Integer(), sa.ForeignKey('tickets.id')),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('events.id')),
        sa.Column('entry_point_id', sa.Integer(), sa.ForeignKey('entry_points.id')),
        sa.Column('scanner_user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('result', sa.String(32)),
        sa.Column('reason', sa.String(255)),
        sa.Column('scanned_at', sa.DateTime(), server_default=sa.func.now()),
    )

def downgrade():
    op.drop_table('scan_logs')
    op.drop_table('scanner_devices')
    op.drop_table('entry_points')
