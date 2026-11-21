from sqlalchemy import Column, Integer, ForeignKey, Numeric, String, DateTime, Text
from datetime import datetime
from app.database import Base

class OrganizerPayout(Base):
    __tablename__ = "organizer_payouts"
    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="EUR")
    status = Column(String(20), default="pending", nullable=False)
    period_start = Column(DateTime)
    period_end = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime)
