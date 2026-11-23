from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.database import Base

class PlatformSettings(Base):
    """Singleton-style platform configuration stored in PostgreSQL."""
    __tablename__ = "platform_settings"
    id = Column(Integer, primary_key=True)
    platform_name = Column(String(255), default="BALKAN EVENTS")
    contact_email = Column(String(255), default="support@balkanevents.org")
    default_currency = Column(String(3), default="EUR")
    default_language = Column(String(10), default="bs")
    support_phone = Column(String(50))
    logo_url = Column(String(500))
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer)
