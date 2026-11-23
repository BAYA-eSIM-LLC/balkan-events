"""Platform settings persistent table

Revision ID: 015_platform_settings
Revises: 014_email_log
Create Date: 2026-11-23
"""
from alembic import op
import sqlalchemy as sa

revision = '015_platform_settings'
down_revision = '014_email_log'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('platform_settings',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('platform_name', sa.String(255), server_default='BALKAN EVENTS'),
        sa.Column('contact_email', sa.String(255), server_default='support@balkanevents.org'),
        sa.Column('default_currency', sa.String(3), server_default='EUR'),
        sa.Column('default_language', sa.String(10), server_default='bs'),
        sa.Column('support_phone', sa.String(50)),
        sa.Column('logo_url', sa.String(500)),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_by', sa.Integer()),
    )
    # Seed one row
    op.execute("INSERT INTO platform_settings (id, platform_name, contact_email, default_currency, default_language) VALUES (1, 'BALKAN EVENTS', 'support@balkanevents.org', 'EUR', 'bs')")

def downgrade():
    op.drop_table('platform_settings')
