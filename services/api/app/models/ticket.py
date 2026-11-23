from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Numeric, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class TicketType(Base):
    __tablename__ = "ticket_types"
    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="EUR")
    quantity_total = Column(Integer, nullable=False)
    quantity_sold = Column(Integer, default=0)
    quantity_reserved = Column(Integer, default=0)
    sale_start = Column(DateTime)
    sale_end = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    event = relationship("Event", back_populates="ticket_types")
    tickets = relationship("Ticket", back_populates="ticket_type")
    inventory = relationship("TicketInventory", back_populates="ticket_type", uselist=False)

    @property
    def quantity_available(self):
        return self.quantity_total - self.quantity_sold - self.quantity_reserved

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True)
    ticket_type_id = Column(Integer, ForeignKey("ticket_types.id"), nullable=False)
    order_item_id = Column(Integer, ForeignKey("order_items.id"))
    seat_id = Column(Integer, ForeignKey("seats.id"), nullable=True)
    code = Column(String(100), unique=True, nullable=False, index=True)
    qr_data = Column(Text)
    is_used = Column(Boolean, default=False)
    used_at = Column(DateTime)
    used_by = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    ticket_type = relationship("TicketType", back_populates="tickets")
