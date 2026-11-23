from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from datetime import datetime
from app.database import Base

class MFARecoveryCode(Base):
    __tablename__ = "mfa_recovery_codes"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    code_hash = Column(String(64), nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class MFAPending(Base):
    __tablename__ = "mfa_pending"
    id = Column(Integer, primary_key=True)
    token_hash = Column(String(64), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
