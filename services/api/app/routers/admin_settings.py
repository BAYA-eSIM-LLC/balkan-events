"""Platform settings backed by PostgreSQL PlatformSettings table."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.deps import require_role
from app.models.user import User, UserRole
from app.models.platform_settings import PlatformSettings
from app.routers.admin_system import ADMIN_ONLY, log_audit

router = APIRouter(prefix="/admin", tags=["admin-settings"])

class SettingsUpdate(BaseModel):
    platform_name: Optional[str] = None
    contact_email: Optional[str] = None
    default_currency: Optional[str] = None
    default_language: Optional[str] = None
    support_phone: Optional[str] = None
    logo_url: Optional[str] = None

async def _get_or_create(db: AsyncSession) -> PlatformSettings:
    row = await db.get(PlatformSettings, 1)
    if not row:
        row = PlatformSettings(id=1)
        db.add(row)
        await db.commit()
        await db.refresh(row)
    return row

@router.get("/settings")
async def get_settings(user: User = Depends(require_role(*ADMIN_ONLY)), db: AsyncSession = Depends(get_db)):
    s = await _get_or_create(db)
    return {
        "platform_name": s.platform_name,
        "contact_email": s.contact_email,
        "default_currency": s.default_currency,
        "default_language": s.default_language,
        "support_phone": s.support_phone,
        "logo_url": s.logo_url,
        "updated_at": s.updated_at.isoformat() if s.updated_at else None,
    }

@router.patch("/settings")
async def update_settings(data: SettingsUpdate, user: User = Depends(require_role(*ADMIN_ONLY)), db: AsyncSession = Depends(get_db)):
    s = await _get_or_create(db)
    changes = {}
    for field in ("platform_name", "contact_email", "default_currency", "default_language", "support_phone", "logo_url"):
        val = getattr(data, field)
        if val is not None:
            setattr(s, field, val)
            changes[field] = val
    s.updated_by = user.id
    await db.commit()
    if changes:
        await log_audit(db, user.id, "platform.settings_updated", "platform_settings", 1, changes)
    return await get_settings(user, db)
