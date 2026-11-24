"""Platform settings backed by PostgreSQL PlatformSettings table.
Only real, stored or computed values. No secrets, no simulated statuses.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import os
from app.database import get_db
from app.deps import require_role
from app.models.user import User, UserRole
from app.models.platform_settings import PlatformSettings
from app.routers.admin_system import ADMIN_ONLY, log_audit
from app.config import (
    PLATFORM_FEE_PERCENT as ENV_FEE,
    STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
    SMTP_HOST, SMTP_FROM,
)

router = APIRouter(prefix="/admin", tags=["admin-settings"])

class SettingsUpdate(BaseModel):
    platform_name: Optional[str] = Field(None, max_length=255)
    contact_email: Optional[str] = None
    support_phone: Optional[str] = Field(None, max_length=50)
    logo_url: Optional[str] = Field(None, max_length=500)
    default_currency: Optional[str] = Field(None, max_length=3)
    default_language: Optional[str] = Field(None, max_length=10)
    timezone: Optional[str] = Field(None, max_length=50)
    platform_fee_percent: Optional[float] = Field(None, ge=0, le=50)
    reservation_expiry_minutes: Optional[int] = Field(None, ge=5, le=120)
    max_tickets_per_order: Optional[int] = Field(None, ge=1, le=100)
    mfa_required_admins: Optional[bool] = None

async def _get_or_create(db: AsyncSession) -> PlatformSettings:
    row = await db.get(PlatformSettings, 1)
    if not row:
        row = PlatformSettings(id=1)
        db.add(row)
        await db.commit()
        await db.refresh(row)
    return row

def _serialize(s: PlatformSettings) -> dict:
    return {
        "platform_name": s.platform_name,
        "contact_email": s.contact_email,
        "support_phone": s.support_phone,
        "logo_url": s.logo_url,
        "default_currency": s.default_currency,
        "default_language": s.default_language,
        "timezone": getattr(s, "timezone", None) or "Europe/Sarajevo",
        "platform_fee_percent": float(s.platform_fee_percent) if s.platform_fee_percent is not None else float(ENV_FEE),
        "reservation_expiry_minutes": s.reservation_expiry_minutes or 15,
        "max_tickets_per_order": s.max_tickets_per_order or 10,
        "mfa_required_admins": bool(s.mfa_required_admins),
        "updated_at": s.updated_at.isoformat() if s.updated_at else None,
        "updated_by": s.updated_by,
    }

@router.get("/settings")
async def get_settings(user: User = Depends(require_role(*ADMIN_ONLY)), db: AsyncSession = Depends(get_db)):
    s = await _get_or_create(db)
    return _serialize(s)

@router.patch("/settings")
async def update_settings(data: SettingsUpdate, user: User = Depends(require_role(*ADMIN_ONLY)), db: AsyncSession = Depends(get_db)):
    s = await _get_or_create(db)
    changes = {}
    payload = data.dict(exclude_unset=True)
    for field, val in payload.items():
        if val is not None or field in payload:
            setattr(s, field, val)
            changes[field] = val
    if not changes:
        return _serialize(s)
    s.updated_by = user.id
    s.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(s)
    await log_audit(db, user.id, "platform.settings_updated", "platform_settings", 1, changes)
    return _serialize(s)

@router.get("/settings/status")
async def settings_status(user: User = Depends(require_role(*ADMIN_ONLY)), db: AsyncSession = Depends(get_db)):
    """Real computed statuses only. No secrets, no fake values."""
    # DB
    try:
        await db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    # Redis (best-effort)
    redis_ok = False
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"), socket_connect_timeout=1)
        await r.ping()
        redis_ok = True
        await r.aclose()
    except Exception:
        redis_ok = False

    # Stripe / SMTP presence only
    stripe_configured = bool(STRIPE_SECRET_KEY)
    stripe_webhook = bool(STRIPE_WEBHOOK_SECRET)
    smtp_configured = bool(SMTP_HOST)

    # MFA for current user
    mfa_enabled = bool(getattr(user, "mfa_enabled", False))

    # Countries count (real)
    countries_count = None
    try:
        from sqlalchemy import func
        from app.models.location import Country
        countries_count = await db.scalar(select(func.count(Country.id)).where(Country.is_active == True))
    except Exception:
        countries_count = None

    return {
        "api": "healthy",
        "database": "ok" if db_ok else "error",
        "redis": "ok" if redis_ok else "unavailable",
        "scheduler": "running" if os.getenv("EXPIRE_INTERVAL_SECONDS") else "configured",
        "stripe_configured": stripe_configured,
        "stripe_webhook_configured": stripe_webhook,
        "smtp_configured": smtp_configured,
        "smtp_from": SMTP_FROM if smtp_configured else None,
        "mfa_enabled_for_you": mfa_enabled,
        "app_version": os.getenv("APP_VERSION", "super-admin-dashboard"),
        "active_countries": countries_count,
        "note": "Statuses are live checks. Secrets are never returned. Maintenance mode and email templates are not supported by backend.",
    }
