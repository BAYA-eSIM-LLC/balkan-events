from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class EventCategory(Base):
    __tablename__ = "event_categories"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("event_categories.id"))
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True)
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
    is_published = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    organization = relationship("Organization", back_populates="events")
    ticket_types = relationship("TicketType", back_populates="event")
