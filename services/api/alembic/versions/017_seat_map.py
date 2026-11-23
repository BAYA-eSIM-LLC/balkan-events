"""Seat Map PRO tables

Revision ID: 017_seat_map
Revises: 016_scanner
Create Date: 2026-11-23
"""
from alembic import op
import sqlalchemy as sa

revision = '017_seat_map'
down_revision = '016_scanner'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('seat_maps',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('events.id'), nullable=False),
        sa.Column('organization_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_seat_maps_event', 'seat_maps', ['event_id'])
    op.create_index('ix_seat_maps_org', 'seat_maps', ['organization_id'])

    op.create_table('sectors',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('seat_map_id', sa.Integer(), sa.ForeignKey('seat_maps.id'), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('sector_type', sa.String(50), server_default='STANDARD'),
        sa.Column('is_numbered', sa.Boolean(), server_default='true'),
        sa.Column('base_price', sa.Numeric(10, 2), nullable=False, server_default='0'),
        sa.Column('currency', sa.String(3), server_default='EUR'),
        sa.Column('capacity', sa.Integer()),
        sa.Column('sort_order', sa.Integer(), server_default='0'),
        sa.Column('color', sa.String(20)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_sectors_seat_map', 'sectors', ['seat_map_id'])

    op.create_table('seat_rows',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('sector_id', sa.Integer(), sa.ForeignKey('sectors.id'), nullable=False),
        sa.Column('label', sa.String(50), nullable=False),
        sa.Column('sort_order', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_seat_rows_sector', 'seat_rows', ['sector_id'])

    op.create_table('seats',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('row_id', sa.Integer(), sa.ForeignKey('seat_rows.id'), nullable=False),
        sa.Column('number', sa.String(20)),
        sa.Column('status', sa.String(20), nullable=False, server_default='FREE'),
        sa.Column('price_override', sa.Numeric(10, 2)),
        sa.Column('x', sa.Integer()),
        sa.Column('y', sa.Integer()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_seats_row', 'seats', ['row_id'])
    op.create_index('ix_seats_status', 'seats', ['status'])
    op.create_index('ix_seats_row_number', 'seats', ['row_id', 'number'])

    op.create_table('seat_reservations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('seat_id', sa.Integer(), sa.ForeignKey('seats.id'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('order_id', sa.Integer(), sa.ForeignKey('orders.id')),
        sa.Column('status', sa.String(20), nullable=False, server_default='ACTIVE'),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('idempotency_key', sa.String(100), unique=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_seat_reservations_seat', 'seat_reservations', ['seat_id'])
    op.create_index('ix_seat_reservations_expires', 'seat_reservations', ['expires_at', 'status'])
    op.create_index('ix_seat_reservations_idem', 'seat_reservations', ['idempotency_key'])

    # Optional link from tickets to seats (does not break existing tickets)
    op.add_column('tickets', sa.Column('seat_id', sa.Integer(), sa.ForeignKey('seats.id'), nullable=True))
    op.create_index('ix_tickets_seat', 'tickets', ['seat_id'])


def downgrade():
    op.drop_index('ix_tickets_seat', table_name='tickets')
    op.drop_column('tickets', 'seat_id')
    op.drop_index('ix_seat_reservations_idem', table_name='seat_reservations')
    op.drop_index('ix_seat_reservations_expires', table_name='seat_reservations')
    op.drop_index('ix_seat_reservations_seat', table_name='seat_reservations')
    op.drop_table('seat_reservations')
    op.drop_index('ix_seats_row_number', table_name='seats')
    op.drop_index('ix_seats_status', table_name='seats')
    op.drop_index('ix_seats_row', table_name='seats')
    op.drop_table('seats')
    op.drop_index('ix_seat_rows_sector', table_name='seat_rows')
    op.drop_table('seat_rows')
    op.drop_index('ix_sectors_seat_map', table_name='sectors')
    op.drop_table('sectors')
    op.drop_index('ix_seat_maps_org', table_name='seat_maps')
    op.drop_index('ix_seat_maps_event', table_name='seat_maps')
    op.drop_table('seat_maps')
