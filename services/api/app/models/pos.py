from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class SalesPoint(Base):
    __tablename__ = "sales_points"
    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    address = Column(String(500))
    contact_phone = Column(String(50))
    contact_email = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization")
    staff = relationship("SalesPointStaff", back_populates="sales_point", cascade="all, delete-orphan")
    registers = relationship("CashRegister", back_populates="sales_point")


class SalesPointStaff(Base):
    __tablename__ = "sales_point_staff"
    id = Column(Integer, primary_key=True)
    sales_point_id = Column(Integer, ForeignKey("sales_points.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(20), default="SELLER")  # SELLER, MANAGER, ADMIN
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    sales_point = relationship("SalesPoint", back_populates="staff")
    user = relationship("User")

    __table_args__ = (
        Index("ix_sp_staff_unique", "sales_point_id", "user_id", unique=True),
    )


class CashRegister(Base):
    __tablename__ = "cash_registers"
    id = Column(Integer, primary_key=True)
    sales_point_id = Column(Integer, ForeignKey("sales_points.id"), nullable=False, index=True)
    opened_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    closed_by = Column(Integer, ForeignKey("users.id"))
    opening_balance = Column(Numeric(10, 2), nullable=False, default=0)
    closing_balance = Column(Numeric(10, 2))
    expected_balance = Column(Numeric(10, 2))
    variance = Column(Numeric(10, 2))
    status = Column(String(20), default="OPEN")  # OPEN, CLOSED
    opened_at = Column(DateTime, default=datetime.utcnow)
    closed_at = Column(DateTime)

    sales_point = relationship("SalesPoint", back_populates="registers")
    transactions = relationship("CashTransaction", back_populates="register")


class CashTransaction(Base):
    __tablename__ = "cash_transactions"
    id = Column(Integer, primary_key=True)
    register_id = Column(Integer, ForeignKey("cash_registers.id"), nullable=False, index=True)
    type = Column(String(20), nullable=False)  # SALE, REFUND, ADJUSTMENT
    amount = Column(Numeric(10, 2), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"))
    seat_id = Column(Integer, ForeignKey("seats.id"))
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    note = Column(Text)
    idempotency_key = Column(String(100), unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    register = relationship("CashRegister", back_populates="transactions")
