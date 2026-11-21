"""Add inventory, reservation, payout, ledger, refresh tokens

Revision ID: 002
Revises: 001
"""
from alembic import op
import sqlalchemy as sa

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('ticket_inventory',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('ticket_type_id', sa.Integer(), sa.ForeignKey('ticket_types.id'), unique=True, nullable=False),
        sa.Column('available', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('reserved', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('sold', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('version', sa.Integer(), nullable=False, server_default='0'),
        sa.CheckConstraint('available >= 0', name='ck_inventory_available_nonneg'),
        sa.CheckConstraint('reserved >= 0', name='ck_inventory_reserved_nonneg'),
        sa.CheckConstraint('sold >= 0', name='ck_inventory_sold_nonneg')
    )
    op.create_table('reservations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('ticket_type_id', sa.Integer(), sa.ForeignKey('ticket_types.id'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='active'),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )
    op.create_index('ix_reservations_expires', 'reservations', ['expires_at', 'status'])
    op.create_table('organizer_payouts',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('organization_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('currency', sa.String(3), server_default='EUR'),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending'),
        sa.Column('period_start', sa.DateTime()),
        sa.Column('period_end', sa.DateTime()),
        sa.Column('notes', sa.Text()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('paid_at', sa.DateTime())
    )
    op.create_table('ledger_entries',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('entry_type', sa.String(50), nullable=False),
        sa.Column('reference_type', sa.String(50)),
        sa.Column('reference_id', sa.Integer()),
        sa.Column('organization_id', sa.Integer(), sa.ForeignKey('organizations.id')),
        sa.Column('amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('currency', sa.String(3), server_default='EUR'),
        sa.Column('description', sa.Text()),
        sa.Column('idempotency_key', sa.String(100), unique=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now())
    )
    op.create_index('ix_ledger_org_created', 'ledger_entries', ['organization_id', 'created_at'])
    op.create_table('refresh_tokens',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('token_hash', sa.String(255), unique=True, nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('is_revoked', sa.Boolean(), server_default='false'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )
    op.create_index('ix_refresh_user', 'refresh_tokens', ['user_id'])
    op.create_unique_constraint('uq_org_member', 'organization_members', ['user_id', 'organization_id'])
    op.create_index('ix_events_city_start', 'events', ['city', 'start_at'])

def downgrade():
    op.drop_index('ix_events_city_start')
    op.drop_constraint('uq_org_member', 'organization_members')
    op.drop_index('ix_refresh_user')
    op.drop_table('refresh_tokens')
    op.drop_index('ix_ledger_org_created')
    op.drop_table('ledger_entries')
    op.drop_table('organizer_payouts')
    op.drop_index('ix_reservations_expires')
    op.drop_table('reservations')
    op.drop_table('ticket_inventory')
