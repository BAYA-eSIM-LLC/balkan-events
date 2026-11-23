from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class EventPermission(Base):
    """Per-event permission override for a member."""
    __tablename__ = "event_permissions"
    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    can_manage = Column(Boolean, default=False)
    can_view_sales = Column(Boolean, default=False)
    can_view_finance = Column(Boolean, default=False)
    can_manage_tickets = Column(Boolean, default=False)
    can_scan = Column(Boolean, default=False)
    can_pos = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event")
    user = relationship("User")

    __table_args__ = (
        Index("ix_event_perm_unique", "event_id", "user_id", unique=True),
    )


class OrgInvitation(Base):
    """Time-limited invitation. Token stored hashed."""
    __tablename__ = "org_invitations"
    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    email = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
    token_hash = Column(String(64), unique=True, nullable=False)
    invited_by = Column(Integer, ForeignKey("users.id"))
    expires_at = Column(DateTime, nullable=False)
    accepted_at = Column(DateTime)
    revoked_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization")
