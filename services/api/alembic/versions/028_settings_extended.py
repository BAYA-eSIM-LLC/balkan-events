"""Extend platform_settings with functional fields used by the platform.

Revision ID: 028_settings_extended
Revises: 027_cms_publish_at
"""
from alembic import op
import sqlalchemy as sa

revision = "028_settings_extended"
down_revision = "027_cms_publish_at"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("platform_settings", sa.Column("timezone", sa.String(50), server_default="Europe/Sarajevo"))
    op.add_column("platform_settings", sa.Column("platform_fee_percent", sa.Numeric(5, 2), server_default="5.0"))
    op.add_column("platform_settings", sa.Column("reservation_expiry_minutes", sa.Integer(), server_default="15"))
    op.add_column("platform_settings", sa.Column("max_tickets_per_order", sa.Integer(), server_default="10"))
    op.add_column("platform_settings", sa.Column("mfa_required_admins", sa.Boolean(), server_default="false"))

def downgrade():
    op.drop_column("platform_settings", "mfa_required_admins")
    op.drop_column("platform_settings", "max_tickets_per_order")
    op.drop_column("platform_settings", "reservation_expiry_minutes")
    op.drop_column("platform_settings", "platform_fee_percent")
    op.drop_column("platform_settings", "timezone")
