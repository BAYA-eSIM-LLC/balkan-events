from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from app.database import Base


class SeatMap(Base):
    __tablename__ = "seat_maps"
    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    event = relationship("Event")
    organization = relationship("Organization")
    sectors = relationship("Sector", back_populates="seat_map", cascade="all, delete-orphan")


class Sector(Base):
    __tablename__ = "sectors"
    id = Column(Integer, primary_key=True)
    seat_map_id = Column(Integer, ForeignKey("seat_maps.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    sector_type = Column(String(50), default="STANDARD")  # STANDARD, VIP, TRIBUNE, STANDING, SPECIAL
    is_numbered = Column(Boolean, default=True)
    base_price = Column(Numeric(10, 2), nullable=False, default=0)
    currency = Column(String(3), default="EUR")
    capacity = Column(Integer)  # for unnumbered sectors
    sort_order = Column(Integer, default=0)
    color = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)

    seat_map = relationship("SeatMap", back_populates="sectors")
    rows = relationship("SeatRow", back_populates="sector", cascade="all, delete-orphan")


class SeatRow(Base):
    __tablename__ = "seat_rows"
    id = Column(Integer, primary_key=True)
    sector_id = Column(Integer, ForeignKey("sectors.id"), nullable=False, index=True)
    label = Column(String(50), nullable=False)  # A, B, 1, 2...
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    sector = relationship("Sector", back_populates="rows")
    seats = relationship("Seat", back_populates="row", cascade="all, delete-orphan")


class Seat(Base):
    __tablename__ = "seats"
    id = Column(Integer, primary_key=True)
    row_id = Column(Integer, ForeignKey("seat_rows.id"), nullable=False, index=True)
    number = Column(String(20))  # "12", null for unnumbered
    status = Column(String(20), default="FREE", nullable=False, index=True)  # FREE, RESERVED, SOLD
    price_override = Column(Numeric(10, 2))
    x = Column(Integer)  # optional visual position
    y = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    row = relationship("SeatRow", back_populates="seats")
    reservations = relationship("SeatReservation", back_populates="seat")

    __table_args__ = (
        Index("ix_seats_row_number", "row_id", "number"),
    )


class SeatReservation(Base):
    __tablename__ = "seat_reservations"
    id = Column(Integer, primary_key=True)
    seat_id = Column(Integer, ForeignKey("seats.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"))
    status = Column(String(20), default="ACTIVE", nullable=False)  # ACTIVE, CONFIRMED, EXPIRED, RELEASED
    expires_at = Column(DateTime, nullable=False)
    idempotency_key = Column(String(100), unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    seat = relationship("Seat", back_populates="reservations")
    user = relationship("User")

    __table_args__ = (
        Index("ix_seat_reservations_expires", "expires_at", "status"),
    )

    @staticmethod
    def default_expiry(minutes: int = 15):
        return datetime.utcnow() + timedelta(minutes=minutes)
