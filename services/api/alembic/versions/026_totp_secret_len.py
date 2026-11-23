"""Widen totp_secret for Fernet ciphertext.

Revision ID: 026_totp_secret_len
Revises: 025_mfa_codes
"""
from alembic import op
import sqlalchemy as sa

revision = "026_totp_secret_len"
down_revision = "025_mfa_codes"
branch_labels = None
depends_on = None

def upgrade():
    op.alter_column("users", "totp_secret", type_=sa.String(255), existing_nullable=True)

def downgrade():
    op.alter_column("users", "totp_secret", type_=sa.String(64), existing_nullable=True)
