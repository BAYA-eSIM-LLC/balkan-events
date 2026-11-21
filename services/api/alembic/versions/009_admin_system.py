"""CORE 1F: Admin system – support tickets, admin notes

Revision ID: 009
Revises: 008
"""
from alembic import op
import sqlalchemy as sa

revision = '009'
down_revision = '008'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('support_tickets',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('subject', sa.String(255), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('status', sa.String(30), server_default='OPEN', nullable=False),
        sa.Column('priority', sa.String(20), server_default='NORMAL'),
        sa.Column('assigned_to', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('closed_at', sa.DateTime())
    )
    op.create_index('ix_support_tickets_status', 'support_tickets', ['status'])
    op.create_index('ix_support_tickets_user', 'support_tickets', ['user_id'])

    op.create_table('admin_notes',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('admin_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('entity_type', sa.String(50), nullable=False),
        sa.Column('entity_id', sa.Integer(), nullable=False),
        sa.Column('note', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )
    op.create_index('ix_admin_notes_entity', 'admin_notes', ['entity_type', 'entity_id'])

def downgrade():
    op.drop_index('ix_admin_notes_entity')
    op.drop_table('admin_notes')
    op.drop_index('ix_support_tickets_user')
    op.drop_index('ix_support_tickets_status')
    op.drop_table('support_tickets')
