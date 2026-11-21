"""CORE 1D: Search indexes, performer slug, admin support

Revision ID: 007
Revises: 006
"""
from alembic import op
import sqlalchemy as sa

revision = '007'
down_revision = '006'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('performers', sa.Column('slug', sa.String(255), unique=True))
    op.add_column('performers', sa.Column('social_links', sa.JSON()))
    op.add_column('performers', sa.Column('country_id', sa.Integer(), sa.ForeignKey('countries.id')))
    op.create_index('ix_performers_name', 'performers', ['name'])
    op.create_index('ix_venues_name', 'venues', ['name'])
    op.create_index('ix_events_title', 'events', ['title'])

def downgrade():
    op.drop_index('ix_events_title')
    op.drop_index('ix_venues_name')
    op.drop_index('ix_performers_name')
    op.drop_column('performers', 'country_id')
    op.drop_column('performers', 'social_links')
    op.drop_column('performers', 'slug')
