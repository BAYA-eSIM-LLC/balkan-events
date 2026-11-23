"""Advanced organizer permissions

Revision ID: 021_permissions
Revises: 020_sponsors
Create Date: 2026-11-23
"""
from alembic import op
import sqlalchemy as sa

revision = '021_permissions'
down_revision = '020_sponsors'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('event_permissions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('events.id'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('organization_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('can_manage', sa.Boolean(), server_default='false'),
        sa.Column('can_view_sales', sa.Boolean(), server_default='false'),
        sa.Column('can_view_finance', sa.Boolean(), server_default='false'),
        sa.Column('can_manage_tickets', sa.Boolean(), server_default='false'),
        sa.Column('can_scan', sa.Boolean(), server_default='false'),
        sa.Column('can_pos', sa.Boolean(), server_default='false'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_event_perm_event', 'event_permissions', ['event_id'])
    op.create_index('ix_event_perm_user', 'event_permissions', ['user_id'])
    op.create_index('ix_event_perm_unique', 'event_permissions', ['event_id', 'user_id'], unique=True)

    op.create_table('org_invitations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('organization_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), nullable=False),
        sa.Column('token_hash', sa.String(64), unique=True, nullable=False),
        sa.Column('invited_by', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('accepted_at', sa.DateTime()),
        sa.Column('revoked_at', sa.DateTime()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_invitations_org', 'org_invitations', ['organization_id'])


def downgrade():
    op.drop_index('ix_invitations_org', table_name='org_invitations')
    op.drop_table('org_invitations')
    op.drop_index('ix_event_perm_unique', table_name='event_permissions')
    op.drop_index('ix_event_perm_user', table_name='event_permissions')
    op.drop_index('ix_event_perm_event', table_name='event_permissions')
    op.drop_table('event_permissions')
