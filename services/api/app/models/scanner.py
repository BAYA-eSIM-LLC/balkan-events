from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from datetime import datetime
from app.database import Base

class EntryPoint(Base):
    __tablename__ = "entry_points"
    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ScannerDevice(Base):
    __tablename__ = "scanner_devices"
    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    entry_point_id = Column(Integer, ForeignKey("entry_points.id"))
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ScanLog(Base):
    __tablename__ = "scan_logs"
    id = Column(Integer, primary_key=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    entry_point_id = Column(Integer, ForeignKey("entry_points.id"))
    scanner_user_id = Column(Integer, ForeignKey("users.id"))
    result = Column(String(32))  # VALID, ALREADY_USED, WRONG_EVENT, INVALID, CANCELLED
    reason = Column(String(255))
    scanned_at = Column(DateTime, default=datetime.utcnow)
