from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class ScanResult(str, enum.Enum):
    VALID = "VALID"
    ALREADY_USED = "ALREADY_USED"
    INVALID = "INVALID"
    CANCELLED = "CANCELLED"
    REFUNDED = "REFUNDED"
    WRONG_EVENT = "WRONG_EVENT"
    UNAUTHORIZED = "UNAUTHORIZED"
    NEEDS_REVIEW = "NEEDS_REVIEW"

class EntryPoint(Base):
    __tablename__ = "entry_points"
    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    name = Column(String(100), nullable=False)
    location = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ScannerAssignment(Base):
    __tablename__ = "scanner_assignments"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    entry_point_id = Column(Integer, ForeignKey("entry_points.id"))
    role = Column(String(50), default="SCANNER_STAFF")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ScanLog(Base):
    __tablename__ = "scan_logs"
    id = Column(Integer, primary_key=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    entry_point_id = Column(Integer, ForeignKey("entry_points.id"))
    scanner_user_id = Column(Integer, ForeignKey("users.id"))
    result = Column(String(50), nullable=False)
    code_scanned = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
