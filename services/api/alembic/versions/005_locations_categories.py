"""CORE 1B: Countries, cities, regions, hierarchical categories

Revision ID: 005
Revises: 004
"""
from alembic import op
import sqlalchemy as sa

revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('countries',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('iso_alpha2', sa.String(2), unique=True, nullable=False),
        sa.Column('iso_alpha3', sa.String(3), unique=True, nullable=False),
        sa.Column('name_en', sa.String(100), nullable=False),
        sa.Column('name_local', sa.String(100)),
        sa.Column('phone_code', sa.String(10)),
        sa.Column('currency_code', sa.String(3)),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )
    op.create_index('ix_countries_alpha2', 'countries', ['iso_alpha2'])

    op.create_table('regions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('code', sa.String(50), unique=True, nullable=False),
        sa.Column('name_en', sa.String(100), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true())
    )

    op.create_table('country_regions',
        sa.Column('country_id', sa.Integer(), sa.ForeignKey('countries.id'), primary_key=True),
        sa.Column('region_id', sa.Integer(), sa.ForeignKey('regions.id'), primary_key=True)
    )

    op.create_table('cities',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('country_id', sa.Integer(), sa.ForeignKey('countries.id'), nullable=False),
        sa.Column('name', sa.String(150), nullable=False),
        sa.Column('name_alt', sa.String(150)),
        sa.Column('region_admin', sa.String(100)),
        sa.Column('postal_code', sa.String(20)),
        sa.Column('latitude', sa.Numeric(10, 7)),
        sa.Column('longitude', sa.Numeric(10, 7)),
        sa.Column('timezone', sa.String(50)),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )
    op.create_index('ix_cities_country_name', 'cities', ['country_id', 'name'])

    # Extend existing event_categories (additive only)
    op.add_column('event_categories', sa.Column('parent_id', sa.Integer(), sa.ForeignKey('event_categories.id')))
    op.add_column('event_categories', sa.Column('description', sa.Text()))
    op.add_column('event_categories', sa.Column('icon', sa.String(100)))
    op.add_column('event_categories', sa.Column('sort_order', sa.Integer(), server_default='0'))
    op.add_column('event_categories', sa.Column('is_active', sa.Boolean(), server_default=sa.true()))
    op.add_column('event_categories', sa.Column('name_local', sa.String(100)))

    # Optional FKs on events (keep existing string columns)
    op.add_column('events', sa.Column('country_id', sa.Integer(), sa.ForeignKey('countries.id')))
    op.add_column('events', sa.Column('city_id', sa.Integer(), sa.ForeignKey('cities.id')))

def downgrade():
    op.drop_column('events', 'city_id')
    op.drop_column('events', 'country_id')
    op.drop_column('event_categories', 'name_local')
    op.drop_column('event_categories', 'is_active')
    op.drop_column('event_categories', 'sort_order')
    op.drop_column('event_categories', 'icon')
    op.drop_column('event_categories', 'description')
    op.drop_column('event_categories', 'parent_id')
    op.drop_index('ix_cities_country_name')
    op.drop_table('cities')
    op.drop_table('country_regions')
    op.drop_table('regions')
    op.drop_index('ix_countries_alpha2')
    op.drop_table('countries')
