from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class GuestList(Base):
    __tablename__ = "guest_lists"
    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event")
    guests = relationship("Guest", back_populates="guest_list", cascade="all, delete-orphan")


class Guest(Base):
    __tablename__ = "guests"
    id = Column(Integer, primary_key=True)
    guest_list_id = Column(Integer, ForeignKey("guest_lists.id"), nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), index=True)
    phone = Column(String(50))
    notes = Column(Text)
    checked_in = Column(Boolean, default=False)
    checked_in_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    guest_list = relationship("GuestList", back_populates="guests")

    __table_args__ = (
        Index("ix_guests_name", "last_name", "first_name"),
    )
