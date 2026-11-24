from sqlalchemy import Column, Integer, String, DateTime, Numeric, Boolean
from datetime import datetime
from app.database import Base

class PlatformSettings(Base):
    """Singleton-style platform configuration stored in PostgreSQL.
    Only fields that are actually stored and can influence behavior or are safely displayed.
    """
    __tablename__ = "platform_settings"
    id = Column(Integer, primary_key=True)
    platform_name = Column(String(255), default="BALKAN EVENTS")
    contact_email = Column(String(255), default="support@balkanevents.org")
    support_phone = Column(String(50))
    logo_url = Column(String(500))
    default_currency = Column(String(3), default="EUR")
    default_language = Column(String(10), default="bs")
    timezone = Column(String(50), default="Europe/Sarajevo")
    platform_fee_percent = Column(Numeric(5, 2), default=5.0)
    reservation_expiry_minutes = Column(Integer, default=15)
    max_tickets_per_order = Column(Integer, default=10)
    mfa_required_admins = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer)
