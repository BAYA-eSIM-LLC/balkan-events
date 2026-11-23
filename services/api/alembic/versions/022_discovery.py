"""User preferences and search history

Revision ID: 022_discovery
Revises: 021_permissions
Create Date: 2026-11-23
"""
from alembic import op
import sqlalchemy as sa

revision = '022_discovery'
down_revision = '021_permissions'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('user_preferences',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), unique=True, nullable=False),
        sa.Column('favorite_categories', sa.JSON()),
        sa.Column('favorite_cities', sa.JSON()),
        sa.Column('followed_organizers', sa.JSON()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_user_preferences_user', 'user_preferences', ['user_id'])

    op.create_table('search_history',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('query', sa.String(255), nullable=False),
        sa.Column('filters', sa.JSON()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_search_history_user', 'search_history', ['user_id'])
    op.create_index('ix_search_query', 'search_history', ['query'])


def downgrade():
    op.drop_index('ix_search_query', table_name='search_history')
    op.drop_index('ix_search_history_user', table_name='search_history')
    op.drop_table('search_history')
    op.drop_index('ix_user_preferences_user', table_name='user_preferences')
    op.drop_table('user_preferences')
