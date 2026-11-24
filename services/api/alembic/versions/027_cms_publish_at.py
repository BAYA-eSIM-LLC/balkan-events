"""Add publish_at for scheduled CMS publishing.

Revision ID: 027_cms_publish_at
Revises: 026_totp_secret_len
"""
from alembic import op
import sqlalchemy as sa

revision = "027_cms_publish_at"
down_revision = "026_totp_secret_len"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("hero_slides", sa.Column("publish_at", sa.DateTime(), nullable=True))
    op.add_column("homepage_sections", sa.Column("publish_at", sa.DateTime(), nullable=True))

def downgrade():
    op.drop_column("homepage_sections", "publish_at")
    op.drop_column("hero_slides", "publish_at")
