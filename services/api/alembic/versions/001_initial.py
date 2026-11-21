"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2026-11-21
"""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255)),
        sa.Column('phone', sa.String(50)),
        sa.Column('role', sa.String(50), default='user'),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('is_verified', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now())
    )
    op.create_table('organizations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(100), unique=True),
        sa.Column('email', sa.String(255)),
        sa.Column('phone', sa.String(50)),
        sa.Column('is_verified', sa.Boolean(), default=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )
    op.create_table('organization_members',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('organization_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('role', sa.String(50), default='staff'),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )
    op.create_table('event_categories',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('slug', sa.String(100), unique=True)
    )
    op.create_table('events',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('organization_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('category_id', sa.Integer(), sa.ForeignKey('event_categories.id')),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(255), unique=True),
        sa.Column('description', sa.Text()),
        sa.Column('venue_name', sa.String(255)),
        sa.Column('venue_address', sa.String(500)),
        sa.Column('city', sa.String(100)),
        sa.Column('country', sa.String(100)),
        sa.Column('latitude', sa.Numeric(10, 7)),
        sa.Column('longitude', sa.Numeric(10, 7)),
        sa.Column('start_at', sa.DateTime(), nullable=False),
        sa.Column('end_at', sa.DateTime()),
        sa.Column('timezone', sa.String(50), default='Europe/Sarajevo'),
        sa.Column('image_url', sa.String(500)),
        sa.Column('is_published', sa.Boolean(), default=False),
        sa.Column('is_featured', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )
    op.create_table('ticket_types',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('events.id'), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), default='EUR'),
        sa.Column('quantity_total', sa.Integer(), nullable=False),
        sa.Column('quantity_sold', sa.Integer(), default=0),
        sa.Column('quantity_reserved', sa.Integer(), default=0),
        sa.Column('sale_start', sa.DateTime()),
        sa.Column('sale_end', sa.DateTime()),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )
    op.create_table('orders',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('status', sa.String(50), default='pending'),
        sa.Column('total_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), default='EUR'),
        sa.Column('reserved_until', sa.DateTime()),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )
    op.create_table('order_items',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('order_id', sa.Integer(), sa.ForeignKey('orders.id'), nullable=False),
        sa.Column('ticket_type_id', sa.Integer(), sa.ForeignKey('ticket_types.id'), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.Numeric(10, 2), nullable=False)
    )
    op.create_table('tickets',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('ticket_type_id', sa.Integer(), sa.ForeignKey('ticket_types.id'), nullable=False),
        sa.Column('order_item_id', sa.Integer(), sa.ForeignKey('order_items.id')),
        sa.Column('code', sa.String(100), unique=True, nullable=False),
        sa.Column('qr_data', sa.Text()),
        sa.Column('is_used', sa.Boolean(), default=False),
        sa.Column('used_at', sa.DateTime()),
        sa.Column('used_by', sa.String(100)),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )
    op.create_table('payments',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('order_id', sa.Integer(), sa.ForeignKey('orders.id'), nullable=False),
        sa.Column('provider', sa.String(50)),
        sa.Column('provider_id', sa.String(255)),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), default='EUR'),
        sa.Column('status', sa.String(50), default='pending'),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )
    op.create_table('refunds',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('payment_id', sa.Integer(), sa.ForeignKey('payments.id'), nullable=False),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('reason', sa.Text()),
        sa.Column('status', sa.String(50), default='pending'),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )
    op.create_table('audit_logs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer()),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('entity_type', sa.String(100)),
        sa.Column('entity_id', sa.Integer()),
        sa.Column('details', sa.JSON()),
        sa.Column('ip_address', sa.String(50)),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )

def downgrade():
    op.drop_table('audit_logs')
    op.drop_table('refunds')
    op.drop_table('payments')
    op.drop_table('tickets')
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('ticket_types')
    op.drop_table('events')
    op.drop_table('event_categories')
    op.drop_table('organization_members')
    op.drop_table('organizations')
    op.drop_table('users')
