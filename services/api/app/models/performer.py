from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Performer(Base):
    __tablename__ = "performers"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True)
    performer_type = Column(String(50), nullable=False)
    bio = Column(Text)
    image_url = Column(String(500))
    website = Column(String(500))
    social_links = Column(JSON)
    country_id = Column(Integer, ForeignKey("countries.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class EventPerformer(Base):
    __tablename__ = "event_performers"
    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    performer_id = Column(Integer, ForeignKey("performers.id"), nullable=False)
    role = Column(String(100))
    sort_order = Column(Integer, default=0)
    __table_args__ = (UniqueConstraint('event_id', 'performer_id', name='uq_event_performer'),)
    event = relationship("Event", back_populates="performers")
    performer = relationship("Performer")

class EventSchedule(Base):
    __tablename__ = "event_schedule"
    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    start_at = Column(DateTime, nullable=False)
    end_at = Column(DateTime)
    performer_id = Column(Integer, ForeignKey("performers.id"))
    sort_order = Column(Integer, default=0)
    event = relationship("Event", back_populates="schedule")
    performer = relationship("Performer")
