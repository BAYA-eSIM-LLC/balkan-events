"""CORE 1A: User profile, verification, reset tokens, favorites, activity

Revision ID: 004
Revises: 003
"""
from alembic import op
import sqlalchemy as sa

revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('users', sa.Column('avatar_url', sa.String(500)))
    op.add_column('users', sa.Column('bio', sa.Text()))
    op.add_column('users', sa.Column('email_verified_at', sa.DateTime()))
    op.add_column('users', sa.Column('preferred_language', sa.String(10), server_default='bs'))
    op.add_column('users', sa.Column('timezone', sa.String(50), server_default='Europe/Sarajevo'))

    op.create_table('email_verification_tokens',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('token_hash', sa.String(255), unique=True, nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('used_at', sa.DateTime()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )

    op.create_table('password_reset_tokens',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('token_hash', sa.String(255), unique=True, nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('used_at', sa.DateTime()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )

    op.create_table('user_favorites',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('event_id', sa.Integer(), sa.ForeignKey('events.id'), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.UniqueConstraint('user_id', 'event_id', name='uq_user_favorite')
    )

    op.create_table('user_activity',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('details', sa.Text()),
        sa.Column('ip_address', sa.String(50)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )
    op.create_index('ix_user_activity_user', 'user_activity', ['user_id', 'created_at'])

def downgrade():
    op.drop_index('ix_user_activity_user')
    op.drop_table('user_activity')
    op.drop_table('user_favorites')
    op.drop_table('password_reset_tokens')
    op.drop_table('email_verification_tokens')
    op.drop_column('users', 'timezone')
    op.drop_column('users', 'preferred_language')
    op.drop_column('users', 'email_verified_at')
    op.drop_column('users', 'bio')
    op.drop_column('users', 'avatar_url')
