from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Sponsor(Base):
    __tablename__ = "sponsors"
    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    website = Column(String(500))
    contact_email = Column(String(255))
    contact_phone = Column(String(50))
    logo_url = Column(String(500))
    category = Column(String(100))
    level = Column(String(50))  # TITLE, MAIN, GOLD, SILVER, PARTNER, MEDIA
    status = Column(String(20), default="ACTIVE")  # ACTIVE, INACTIVE, EXPIRED
    contract_start = Column(DateTime)
    contract_end = Column(DateTime)
    contract_value = Column(Numeric(12, 2))  # agreed value, not collected revenue
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization")
    placements = relationship("SponsorPlacement", back_populates="sponsor", cascade="all, delete-orphan")


class SponsorPackage(Base):
    __tablename__ = "sponsor_packages"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)  # Title Sponsor, Main, Gold, Silver, Official Partner, Media Partner
    code = Column(String(50), unique=True)
    price = Column(Numeric(12, 2), default=0)
    duration_days = Column(Integer)
    max_positions = Column(Integer)
    benefits = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SponsorPlacement(Base):
    __tablename__ = "sponsor_placements"
    id = Column(Integer, primary_key=True)
    sponsor_id = Column(Integer, ForeignKey("sponsors.id"), nullable=False, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), index=True)
    position = Column(String(50), nullable=False)  # HOMEPAGE, EVENT_PAGE, EVENT_HEADER, EVENT_FOOTER, ORGANIZER, PROMO
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    starts_at = Column(DateTime)
    ends_at = Column(DateTime)
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    sponsor = relationship("Sponsor", back_populates="placements")
    event = relationship("Event")

    __table_args__ = (
        Index("ix_placement_position", "position", "is_active"),
    )
