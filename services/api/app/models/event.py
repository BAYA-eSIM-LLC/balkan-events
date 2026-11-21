from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Numeric, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum

class EventStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"
    PUBLISHED = "PUBLISHED"
    SUSPENDED = "SUSPENDED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"

class EventCategory(Base):
    __tablename__ = "event_categories"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True)
    parent_id = Column(Integer, ForeignKey("event_categories.id"))
    description = Column(Text)
    icon = Column(String(100))
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    name_local = Column(String(100))
    parent = relationship("EventCategory", remote_side=[id], backref="children")

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("event_categories.id"))
    subcategory_id = Column(Integer, ForeignKey("event_categories.id"))
    country_id = Column(Integer, ForeignKey("countries.id"))
    city_id = Column(Integer, ForeignKey("cities.id"))
    venue_id = Column(Integer, ForeignKey("venues.id"))
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True)
    short_description = Column(String(500))
    description = Column(Text)
    venue_name = Column(String(255))
    venue_address = Column(String(500))
    city = Column(String(100), index=True)
    country = Column(String(100))
    latitude = Column(Numeric(10, 7))
    longitude = Column(Numeric(10, 7))
    start_at = Column(DateTime, nullable=False, index=True)
    end_at = Column(DateTime)
    timezone = Column(String(50), default="Europe/Sarajevo")
    image_url = Column(String(500))
    gallery = Column(JSON)
    age_limit = Column(Integer)
    entry_rules = Column(Text)
    cancellation_policy = Column(Text)
    contact_email = Column(String(255))
    contact_phone = Column(String(50))
    website = Column(String(500))
    social_links = Column(JSON)
    status = Column(String(20), default=EventStatus.DRAFT.value, nullable=False, index=True)
    is_published = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    published_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    organization = relationship("Organization", back_populates="events")
    ticket_types = relationship("TicketType", back_populates="event")
    venue = relationship("Venue", back_populates="events")
    performers = relationship("EventPerformer", back_populates="event")
    schedule = relationship("EventSchedule", back_populates="event")
