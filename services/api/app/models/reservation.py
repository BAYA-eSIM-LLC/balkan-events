from sqlalchemy import Column, Integer, ForeignKey, DateTime, String, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from app.database import Base

class Reservation(Base):
    __tablename__ = "reservations"
    id = Column(Integer, primary_key=True)
    ticket_type_id = Column(Integer, ForeignKey("ticket_types.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    status = Column(String(20), default="active", nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (
        Index("ix_reservations_expires", "expires_at", "status"),
    )
    ticket_type = relationship("TicketType")
    user = relationship("User")

    @staticmethod
    def default_expiry():
        return datetime.utcnow() + timedelta(minutes=15)
