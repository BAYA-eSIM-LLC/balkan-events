"""MFA recovery codes and pending tokens.

Revision ID: 025_mfa_codes
Revises: 024_mfa
"""
from alembic import op
import sqlalchemy as sa

revision = "025_mfa_codes"
down_revision = "024_mfa"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "mfa_recovery_codes",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("code_hash", sa.String(64), nullable=False),
        sa.Column("used", sa.Boolean, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_table(
        "mfa_pending",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("token_hash", sa.String(64), unique=True, nullable=False, index=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("expires_at", sa.DateTime, nullable=False),
        sa.Column("attempts", sa.Integer, server_default="0"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

def downgrade():
    op.drop_table("mfa_pending")
    op.drop_table("mfa_recovery_codes")
