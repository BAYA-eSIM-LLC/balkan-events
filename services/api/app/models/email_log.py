from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from datetime import datetime
from app.database import Base

class EmailLog(Base):
    """Record of emails that would be sent. Prevents double-send."""
    __tablename__ = "email_logs"
    id = Column(Integer, primary_key=True)
    to_email = Column(String(255), nullable=False)
    subject = Column(String(255))
    body = Column(Text)
    template = Column(String(100))
    reference_type = Column(String(50))
    reference_id = Column(Integer)
    idempotency_key = Column(String(100), unique=True)
    sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
