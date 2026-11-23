"""CMS hero, sections and media library

Revision ID: 010_cms
Revises: 009_admin_system
Create Date: 2026-11-23
"""
from alembic import op
import sqlalchemy as sa

revision = '010_cms'
down_revision = '009'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'media_assets',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('original_name', sa.String(255)),
        sa.Column('mime_type', sa.String(100)),
        sa.Column('size_bytes', sa.Integer()),
        sa.Column('url', sa.String(500), nullable=False),
        sa.Column('category', sa.String(100)),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('uploaded_by', sa.Integer()),
    )
    op.create_table(
        'hero_slides',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(255)),
        sa.Column('subtitle', sa.Text()),
        sa.Column('image_url', sa.String(500), nullable=False),
        sa.Column('mobile_image_url', sa.String(500)),
        sa.Column('video_url', sa.String(500)),
        sa.Column('poster_url', sa.String(500)),
        sa.Column('category', sa.String(100)),
        sa.Column('sort_order', sa.Integer(), server_default='0'),
        sa.Column('duration_seconds', sa.Integer(), server_default='6'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('is_published', sa.Boolean(), server_default='false'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_table(
        'homepage_sections',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('key', sa.String(100), unique=True, nullable=False),
        sa.Column('title', sa.String(255)),
        sa.Column('description', sa.Text()),
        sa.Column('image_url', sa.String(500)),
        sa.Column('video_url', sa.String(500)),
        sa.Column('category', sa.String(100)),
        sa.Column('content', sa.JSON()),
        sa.Column('platforms', sa.String(100), server_default='web,ios,android'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('is_published', sa.Boolean(), server_default='false'),
        sa.Column('sort_order', sa.Integer(), server_default='0'),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )

def downgrade():
    op.drop_table('homepage_sections')
    op.drop_table('hero_slides')
    op.drop_table('media_assets')
