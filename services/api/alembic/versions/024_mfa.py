"""Add MFA columns to users.

Revision ID: 024_mfa
Revises: 023_scanner_tokens
"""
from alembic import op
import sqlalchemy as sa

revision = "024_mfa"
down_revision = "023_scanner_tokens"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("users", sa.Column("totp_secret", sa.String(64), nullable=True))
    op.add_column("users", sa.Column("mfa_enabled", sa.Boolean(), server_default=sa.false(), nullable=False))

def downgrade():
    op.drop_column("users", "mfa_enabled")
    op.drop_column("users", "totp_secret")
