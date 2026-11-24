"""password reset tokens

Revision ID: 029_password_reset
Revises: 028_settings_extended
Create Date: 2026-11-24
"""
from alembic import op
import sqlalchemy as sa

revision = "029_password_reset"
down_revision = "028_settings_extended"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "password_reset_tokens",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("token_hash", sa.String(255), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime, nullable=False),
        sa.Column("used", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime, default=sa.func.now()),
    )

def downgrade():
    op.drop_table("password_reset_tokens")
