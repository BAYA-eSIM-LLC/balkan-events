"""scanner tables

Revision ID: 010_scanner
Revises: 009
Create Date: 2026-11-21

"""
from alembic import op
import sqlalchemy as sa

revision = '010_scanner'
down_revision = '009'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('entry_points',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('event_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('location', sa.String(255)),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime()),
        sa.ForeignKeyConstraint(['event_id'], ['events.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('scanner_assignments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('event_id', sa.Integer(), nullable=False),
        sa.Column('entry_point_id', sa.Integer()),
        sa.Column('role', sa.String(50), default='SCANNER_STAFF'),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['event_id'], ['events.id']),
        sa.ForeignKeyConstraint(['entry_point_id'], ['entry_points.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('scan_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('ticket_id', sa.Integer()),
        sa.Column('event_id', sa.Integer()),
        sa.Column('entry_point_id', sa.Integer()),
        sa.Column('scanner_user_id', sa.Integer()),
        sa.Column('result', sa.String(50), nullable=False),
        sa.Column('code_scanned', sa.String(100)),
        sa.Column('created_at', sa.DateTime()),
        sa.ForeignKeyConstraint(['ticket_id'], ['tickets.id']),
        sa.ForeignKeyConstraint(['event_id'], ['events.id']),
        sa.ForeignKeyConstraint(['entry_point_id'], ['entry_points.id']),
        sa.ForeignKeyConstraint(['scanner_user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_scan_logs_event', 'scan_logs', ['event_id'])
    op.create_index('ix_scan_logs_result', 'scan_logs', ['result'])

def downgrade():
    op.drop_index('ix_scan_logs_result')
    op.drop_index('ix_scan_logs_event')
    op.drop_table('scan_logs')
    op.drop_table('scanner_assignments')
    op.drop_table('entry_points')
