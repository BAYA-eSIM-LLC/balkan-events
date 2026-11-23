"""Guest lists tables

Revision ID: 019_guest_lists
Revises: 018_pos
Create Date: 2026-11-23
"""
from alembic import op
import sqlalchemy as sa

revision = '019_guest_lists'
down_revision = '018_pos'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('guest_lists',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('events.id'), nullable=False),
        sa.Column('organization_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('created_by', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_guest_lists_event', 'guest_lists', ['event_id'])
    op.create_index('ix_guest_lists_org', 'guest_lists', ['organization_id'])

    op.create_table('guests',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('guest_list_id', sa.Integer(), sa.ForeignKey('guest_lists.id'), nullable=False),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(255)),
        sa.Column('phone', sa.String(50)),
        sa.Column('notes', sa.Text()),
        sa.Column('checked_in', sa.Boolean(), server_default='false'),
        sa.Column('checked_in_at', sa.DateTime()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_guests_list', 'guests', ['guest_list_id'])
    op.create_index('ix_guests_email', 'guests', ['email'])
    op.create_index('ix_guests_name', 'guests', ['last_name', 'first_name'])


def downgrade():
    op.drop_index('ix_guests_name', table_name='guests')
    op.drop_index('ix_guests_email', table_name='guests')
    op.drop_index('ix_guests_list', table_name='guests')
    op.drop_table('guests')
    op.drop_index('ix_guest_lists_org', table_name='guest_lists')
    op.drop_index('ix_guest_lists_event', table_name='guest_lists')
    op.drop_table('guest_lists')
