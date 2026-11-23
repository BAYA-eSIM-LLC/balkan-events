from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class UserPreference(Base):
    __tablename__ = "user_preferences"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    favorite_categories = Column(JSON, default=list)
    favorite_cities = Column(JSON, default=list)
    followed_organizers = Column(JSON, default=list)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")


class SearchHistory(Base):
    __tablename__ = "search_history"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    query = Column(String(255), nullable=False)
    filters = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User")

    __table_args__ = (
        Index("ix_search_query", "query"),
    )
