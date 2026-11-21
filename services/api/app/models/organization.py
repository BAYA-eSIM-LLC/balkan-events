from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class OrgRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    EVENT_MANAGER = "event_manager"
    SALES_MANAGER = "sales_manager"
    FINANCE_VIEWER = "finance_viewer"
    SCANNER = "scanner"
    STAFF = "staff"

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, index=True)
    email = Column(String(255))
    phone = Column(String(50))
    legal_form = Column(String(100))
    country_id = Column(Integer, ForeignKey("countries.id"))
    registration_number = Column(String(100))
    vat_number = Column(String(50))
    address = Column(String(500))
    city_id = Column(Integer, ForeignKey("cities.id"))
    postal_code = Column(String(20))
    website = Column(String(500))
    logo_url = Column(String(500))
    description = Column(Text)
    contact_person = Column(String(255))
    org_type = Column(String(50), default="company")
    verification_status = Column(String(30), default="NOT_SUBMITTED")
    verification_submitted_at = Column(DateTime)
    verified_at = Column(DateTime)
    verified_by = Column(Integer)
    rejection_reason = Column(Text)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    members = relationship("OrganizationMember", back_populates="organization")
    events = relationship("Event", back_populates="organization")

class OrganizationMember(Base):
    __tablename__ = "organization_members"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    role = Column(String(50), default=OrgRole.STAFF.value)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="memberships")
    organization = relationship("Organization", back_populates="members")
