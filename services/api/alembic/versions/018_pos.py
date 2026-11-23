"""POS PRO tables

Revision ID: 018_pos
Revises: 017_seat_map
Create Date: 2026-11-23
"""
from alembic import op
import sqlalchemy as sa

revision = '018_pos'
down_revision = '017_seat_map'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('sales_points',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('organization_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('address', sa.String(500)),
        sa.Column('contact_phone', sa.String(50)),
        sa.Column('contact_email', sa.String(255)),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_sales_points_org', 'sales_points', ['organization_id'])

    op.create_table('sales_point_staff',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('sales_point_id', sa.Integer(), sa.ForeignKey('sales_points.id'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('role', sa.String(20), server_default='SELLER'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_sp_staff_point', 'sales_point_staff', ['sales_point_id'])
    op.create_index('ix_sp_staff_unique', 'sales_point_staff', ['sales_point_id', 'user_id'], unique=True)

    op.create_table('cash_registers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('sales_point_id', sa.Integer(), sa.ForeignKey('sales_points.id'), nullable=False),
        sa.Column('opened_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('closed_by', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('opening_balance', sa.Numeric(10, 2), nullable=False, server_default='0'),
        sa.Column('closing_balance', sa.Numeric(10, 2)),
        sa.Column('expected_balance', sa.Numeric(10, 2)),
        sa.Column('variance', sa.Numeric(10, 2)),
        sa.Column('status', sa.String(20), server_default='OPEN'),
        sa.Column('opened_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('closed_at', sa.DateTime()),
    )
    op.create_index('ix_cash_registers_point', 'cash_registers', ['sales_point_id'])

    op.create_table('cash_transactions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('register_id', sa.Integer(), sa.ForeignKey('cash_registers.id'), nullable=False),
        sa.Column('type', sa.String(20), nullable=False),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('order_id', sa.Integer(), sa.ForeignKey('orders.id')),
        sa.Column('seat_id', sa.Integer(), sa.ForeignKey('seats.id')),
        sa.Column('created_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('note', sa.Text()),
        sa.Column('idempotency_key', sa.String(100), unique=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_cash_tx_register', 'cash_transactions', ['register_id'])
    op.create_index('ix_cash_tx_idem', 'cash_transactions', ['idempotency_key'])


def downgrade():
    op.drop_index('ix_cash_tx_idem', table_name='cash_transactions')
    op.drop_index('ix_cash_tx_register', table_name='cash_transactions')
    op.drop_table('cash_transactions')
    op.drop_index('ix_cash_registers_point', table_name='cash_registers')
    op.drop_table('cash_registers')
    op.drop_index('ix_sp_staff_unique', table_name='sales_point_staff')
    op.drop_index('ix_sp_staff_point', table_name='sales_point_staff')
    op.drop_table('sales_point_staff')
    op.drop_index('ix_sales_points_org', table_name='sales_points')
    op.drop_table('sales_points')
