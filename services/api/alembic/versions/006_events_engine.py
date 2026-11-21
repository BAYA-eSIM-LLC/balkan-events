"""CORE 1C: Events engine – venues, performers, schedule, status lifecycle

Revision ID: 006
Revises: 005
"""
from alembic import op
import sqlalchemy as sa

revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None

def upgrade():
    # Extend events (additive)
    op.add_column('events', sa.Column('short_description', sa.String(500)))
    op.add_column('events', sa.Column('gallery', sa.JSON()))
    op.add_column('events', sa.Column('subcategory_id', sa.Integer(), sa.ForeignKey('event_categories.id')))
    op.add_column('events', sa.Column('venue_id', sa.Integer()))
    op.add_column('events', sa.Column('age_limit', sa.Integer()))
    op.add_column('events', sa.Column('entry_rules', sa.Text()))
    op.add_column('events', sa.Column('cancellation_policy', sa.Text()))
    op.add_column('events', sa.Column('contact_email', sa.String(255)))
    op.add_column('events', sa.Column('contact_phone', sa.String(50)))
    op.add_column('events', sa.Column('website', sa.String(500)))
    op.add_column('events', sa.Column('social_links', sa.JSON()))
    op.add_column('events', sa.Column('status', sa.String(20), server_default='DRAFT', nullable=False))
    op.add_column('events', sa.Column('published_at', sa.DateTime()))
    op.add_column('events', sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()))
    op.create_index('ix_events_status', 'events', ['status'])

    op.create_table('venues',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('country_id', sa.Integer(), sa.ForeignKey('countries.id')),
        sa.Column('city_id', sa.Integer(), sa.ForeignKey('cities.id')),
        sa.Column('address', sa.String(500)),
        sa.Column('latitude', sa.Numeric(10, 7)),
        sa.Column('longitude', sa.Numeric(10, 7)),
        sa.Column('capacity', sa.Integer()),
        sa.Column('venue_type', sa.String(100)),
        sa.Column('website', sa.String(500)),
        sa.Column('contact_email', sa.String(255)),
        sa.Column('contact_phone', sa.String(50)),
        sa.Column('timezone', sa.String(50)),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )

    op.create_foreign_key('fk_events_venue', 'events', 'venues', ['venue_id'], ['id'])

    op.create_table('performers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('performer_type', sa.String(50), nullable=False),
        sa.Column('bio', sa.Text()),
        sa.Column('image_url', sa.String(500)),
        sa.Column('website', sa.String(500)),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )

    op.create_table('event_performers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('events.id'), nullable=False),
        sa.Column('performer_id', sa.Integer(), sa.ForeignKey('performers.id'), nullable=False),
        sa.Column('role', sa.String(100)),
        sa.Column('sort_order', sa.Integer(), server_default='0'),
        sa.UniqueConstraint('event_id', 'performer_id', name='uq_event_performer')
    )

    op.create_table('event_schedule',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('events.id'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('start_at', sa.DateTime(), nullable=False),
        sa.Column('end_at', sa.DateTime()),
        sa.Column('performer_id', sa.Integer(), sa.ForeignKey('performers.id')),
        sa.Column('sort_order', sa.Integer(), server_default='0')
    )
    op.create_index('ix_event_schedule_event', 'event_schedule', ['event_id', 'start_at'])

def downgrade():
    op.drop_index('ix_event_schedule_event')
    op.drop_table('event_schedule')
    op.drop_table('event_performers')
    op.drop_table('performers')
    op.drop_constraint('fk_events_venue', 'events', type_='foreignkey')
    op.drop_table('venues')
    op.drop_index('ix_events_status')
    op.drop_column('events', 'updated_at')
    op.drop_column('events', 'published_at')
    op.drop_column('events', 'status')
    op.drop_column('events', 'social_links')
    op.drop_column('events', 'website')
    op.drop_column('events', 'contact_phone')
    op.drop_column('events', 'contact_email')
    op.drop_column('events', 'cancellation_policy')
    op.drop_column('events', 'entry_rules')
    op.drop_column('events', 'age_limit')
    op.drop_column('events', 'venue_id')
    op.drop_column('events', 'subcategory_id')
    op.drop_column('events', 'gallery')
    op.drop_column('events', 'short_description')
