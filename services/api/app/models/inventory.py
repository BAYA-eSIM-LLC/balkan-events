from sqlalchemy import Column, Integer, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class TicketInventory(Base):
    __tablename__ = "ticket_inventory"
    id = Column(Integer, primary_key=True)
    ticket_type_id = Column(Integer, ForeignKey("ticket_types.id"), unique=True, nullable=False)
    available = Column(Integer, nullable=False, default=0)
    reserved = Column(Integer, nullable=False, default=0)
    sold = Column(Integer, nullable=False, default=0)
    version = Column(Integer, nullable=False, default=0)
    __table_args__ = (
        CheckConstraint("available >= 0", name="ck_inventory_available_nonneg"),
        CheckConstraint("reserved >= 0", name="ck_inventory_reserved_nonneg"),
        CheckConstraint("sold >= 0", name="ck_inventory_sold_nonneg"),
    )
    ticket_type = relationship("TicketType", back_populates="inventory")
