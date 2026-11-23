"""Sponsors and monetization tables

Revision ID: 020_sponsors
Revises: 019_guest_lists
Create Date: 2026-11-23
"""
from alembic import op
import sqlalchemy as sa

revision = '020_sponsors'
down_revision = '019_guest_lists'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('sponsors',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('organization_id', sa.Integer(), sa.ForeignKey('organizations.id')),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('website', sa.String(500)),
        sa.Column('contact_email', sa.String(255)),
        sa.Column('contact_phone', sa.String(50)),
        sa.Column('logo_url', sa.String(500)),
        sa.Column('category', sa.String(100)),
        sa.Column('level', sa.String(50)),
        sa.Column('status', sa.String(20), server_default='ACTIVE'),
        sa.Column('contract_start', sa.DateTime()),
        sa.Column('contract_end', sa.DateTime()),
        sa.Column('contract_value', sa.Numeric(12, 2)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_sponsors_org', 'sponsors', ['organization_id'])

    op.create_table('sponsor_packages',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('code', sa.String(50), unique=True),
        sa.Column('price', sa.Numeric(12, 2), server_default='0'),
        sa.Column('duration_days', sa.Integer()),
        sa.Column('max_positions', sa.Integer()),
        sa.Column('benefits', sa.Text()),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table('sponsor_placements',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('sponsor_id', sa.Integer(), sa.ForeignKey('sponsors.id'), nullable=False),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('events.id')),
        sa.Column('position', sa.String(50), nullable=False),
        sa.Column('sort_order', sa.Integer(), server_default='0'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('starts_at', sa.DateTime()),
        sa.Column('ends_at', sa.DateTime()),
        sa.Column('impressions', sa.Integer(), server_default='0'),
        sa.Column('clicks', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_placements_sponsor', 'sponsor_placements', ['sponsor_id'])
    op.create_index('ix_placement_position', 'sponsor_placements', ['position', 'is_active'])


def downgrade():
    op.drop_index('ix_placement_position', table_name='sponsor_placements')
    op.drop_index('ix_placements_sponsor', table_name='sponsor_placements')
    op.drop_table('sponsor_placements')
    op.drop_table('sponsor_packages')
    op.drop_index('ix_sponsors_org', table_name='sponsors')
    op.drop_table('sponsors')
