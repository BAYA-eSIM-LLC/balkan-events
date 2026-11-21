"""CORE 1E: Organizer portal – business profile, verification, notifications

Revision ID: 008
Revises: 007
"""
from alembic import op
import sqlalchemy as sa

revision = '008'
down_revision = '007'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('organizations', sa.Column('legal_form', sa.String(100)))
    op.add_column('organizations', sa.Column('country_id', sa.Integer(), sa.ForeignKey('countries.id')))
    op.add_column('organizations', sa.Column('registration_number', sa.String(100)))
    op.add_column('organizations', sa.Column('vat_number', sa.String(50)))
    op.add_column('organizations', sa.Column('address', sa.String(500)))
    op.add_column('organizations', sa.Column('city_id', sa.Integer(), sa.ForeignKey('cities.id')))
    op.add_column('organizations', sa.Column('postal_code', sa.String(20)))
    op.add_column('organizations', sa.Column('website', sa.String(500)))
    op.add_column('organizations', sa.Column('logo_url', sa.String(500)))
    op.add_column('organizations', sa.Column('description', sa.Text()))
    op.add_column('organizations', sa.Column('contact_person', sa.String(255)))
    op.add_column('organizations', sa.Column('org_type', sa.String(50), server_default='company'))
    op.add_column('organizations', sa.Column('verification_status', sa.String(30), server_default='NOT_SUBMITTED'))
    op.add_column('organizations', sa.Column('verification_submitted_at', sa.DateTime()))
    op.add_column('organizations', sa.Column('verified_at', sa.DateTime()))
    op.add_column('organizations', sa.Column('verified_by', sa.Integer()))
    op.add_column('organizations', sa.Column('rejection_reason', sa.Text()))

    op.create_table('org_documents',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('organization_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('doc_type', sa.String(100), nullable=False),
        sa.Column('file_reference', sa.String(500), nullable=False),
        sa.Column('uploaded_by', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('uploaded_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('is_private', sa.Boolean(), server_default=sa.true())
    )

    op.create_table('org_notifications',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('organization_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('notification_type', sa.String(100), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('body', sa.Text()),
        sa.Column('is_read', sa.Boolean(), server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )
    op.create_index('ix_org_notifications_org', 'org_notifications', ['organization_id', 'is_read'])

def downgrade():
    op.drop_index('ix_org_notifications_org')
    op.drop_table('org_notifications')
    op.drop_table('org_documents')
    op.drop_column('organizations', 'rejection_reason')
    op.drop_column('organizations', 'verified_by')
    op.drop_column('organizations', 'verified_at')
    op.drop_column('organizations', 'verification_submitted_at')
    op.drop_column('organizations', 'verification_status')
    op.drop_column('organizations', 'org_type')
    op.drop_column('organizations', 'contact_person')
    op.drop_column('organizations', 'description')
    op.drop_column('organizations', 'logo_url')
    op.drop_column('organizations', 'website')
    op.drop_column('organizations', 'postal_code')
    op.drop_column('organizations', 'city_id')
    op.drop_column('organizations', 'address')
    op.drop_column('organizations', 'vat_number')
    op.drop_column('organizations', 'registration_number')
    op.drop_column('organizations', 'country_id')
    op.drop_column('organizations', 'legal_form')
