from sqlalchemy import Column, Integer, ForeignKey, Numeric, String, DateTime, Text, Index
from datetime import datetime
from app.database import Base

class LedgerEntry(Base):
    __tablename__ = "ledger_entries"
    id = Column(Integer, primary_key=True)
    entry_type = Column(String(50), nullable=False)
    reference_type = Column(String(50))
    reference_id = Column(Integer)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="EUR")
    description = Column(Text)
    idempotency_key = Column(String(100), unique=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    __table_args__ = (
        Index("ix_ledger_org_created", "organization_id", "created_at"),
    )
