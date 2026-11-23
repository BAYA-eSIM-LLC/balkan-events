from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON
from datetime import datetime
from app.database import Base

class HeroSlide(Base):
    __tablename__ = "hero_slides"
    id = Column(Integer, primary_key=True)
    title = Column(String(255))
    subtitle = Column(Text)
    image_url = Column(String(500), nullable=False)
    mobile_image_url = Column(String(500))
    video_url = Column(String(500))
    category = Column(String(100))
    sort_order = Column(Integer, default=0)
    duration_seconds = Column(Integer, default=6)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class HomepageSection(Base):
    __tablename__ = "homepage_sections"
    id = Column(Integer, primary_key=True)
    key = Column(String(100), unique=True, nullable=False)
    title = Column(String(255))
    content = Column(JSON)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
