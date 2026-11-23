from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.database import get_db
from app.models.sponsor import Sponsor, SponsorPackage, SponsorPlacement
from app.models.event import Event
from app.models.user import User, UserRole
from app.deps import get_current_user, require_role, get_org_member
from app.services.permissions import check_event_cap
from app.routers.admin_system import log_audit

router = APIRouter(prefix="/sponsors", tags=["sponsors"])
admin_router = APIRouter(prefix="/admin/sponsors", tags=["admin-sponsors"])
public_router = APIRouter(prefix="/public/sponsors", tags=["public-sponsors"])

ADMIN_ROLES = (UserRole.ADMIN, UserRole.SUPERADMIN)
LEVELS = {"TITLE", "MAIN", "GOLD", "SILVER", "PARTNER", "MEDIA"}
POSITIONS = {"HOMEPAGE", "EVENT_PAGE", "EVENT_HEADER", "EVENT_FOOTER", "ORGANIZER", "PROMO"}


class SponsorCreate(BaseModel):
    organization_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    logo_url: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    contract_start: Optional[datetime] = None
    contract_end: Optional[datetime] = None
    contract_value: Optional[float] = None


class PackageCreate(BaseModel):
    name: str
    code: str
    price: float = 0
    duration_days: Optional[int] = None
    max_positions: Optional[int] = None
    benefits: Optional[str] = None


class PlacementCreate(BaseModel):
    sponsor_id: int
    event_id: Optional[int] = None
    position: str
    sort_order: int = 0
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None


async def _check_sponsor_access(db: AsyncSession, sponsor: Sponsor, user: User):
    if user.role in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        return
    if not sponsor.organization_id:
        raise HTTPException(403)
    await get_org_member(sponsor.organization_id, user, db)


@admin_router.post("")
async def admin_create_sponsor(data: SponsorCreate, user: User = Depends(require_role(*ADMIN_ROLES)), db: AsyncSession = Depends(get_db)):
    if data.level and data.level not in LEVELS:
        raise HTTPException(400, "Invalid level")
    s = Sponsor(**data.model_dump())
    db.add(s)
    await db.commit()
    await db.refresh(s)
    await log_audit(db, user.id, "sponsor.created", "Sponsor", s.id)
    return {"id": s.id, "name": s.name}


@admin_router.get("")
async def admin_list_sponsors(user: User = Depends(require_role(*ADMIN_ROLES)), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Sponsor).order_by(Sponsor.created_at.desc()).limit(200))
    sponsors = result.scalars().all()
    return [{"id": s.id, "name": s.name, "level": s.level, "status": s.status, "organization_id": s.organization_id, "contract_value": float(s.contract_value or 0)} for s in sponsors]


@admin_router.patch("/{sponsor_id}")
async def admin_update_sponsor(sponsor_id: int, status: Optional[str] = None, user: User = Depends(require_role(*ADMIN_ROLES)), db: AsyncSession = Depends(get_db)):
    s = await db.get(Sponsor, sponsor_id)
    if not s:
        raise HTTPException(404)
    if status:
        s.status = status
    await db.commit()
    await log_audit(db, user.id, "sponsor.updated", "Sponsor", s.id, {"status": status})
    return {"id": s.id, "status": s.status}


@admin_router.post("/packages")
async def create_package(data: PackageCreate, user: User = Depends(require_role(*ADMIN_ROLES)), db: AsyncSession = Depends(get_db)):
    p = SponsorPackage(**data.model_dump())
    db.add(p)
    await db.commit()
    await db.refresh(p)
    return {"id": p.id, "name": p.name, "code": p.code}


@admin_router.get("/packages")
async def list_packages(user: User = Depends(require_role(*ADMIN_ROLES)), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SponsorPackage).where(SponsorPackage.is_active == True))
    return [{"id": p.id, "name": p.name, "code": p.code, "price": float(p.price or 0), "duration_days": p.duration_days, "max_positions": p.max_positions} for p in result.scalars()]


@router.post("")
async def organizer_create_sponsor(data: SponsorCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not data.organization_id:
        raise HTTPException(400, "organization_id required")
    if user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        await get_org_member(data.organization_id, user, db)
    if data.level and data.level not in LEVELS:
        raise HTTPException(400, "Invalid level")
    s = Sponsor(**data.model_dump())
    db.add(s)
    await db.commit()
    await db.refresh(s)
    await log_audit(db, user.id, "sponsor.created", "Sponsor", s.id)
    return {"id": s.id, "name": s.name}


@router.get("")
async def organizer_list_sponsors(organization_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        await get_org_member(organization_id, user, db)
    result = await db.execute(select(Sponsor).where(Sponsor.organization_id == organization_id))
    return [{"id": s.id, "name": s.name, "level": s.level, "status": s.status} for s in result.scalars()]


@router.post("/placements")
async def create_placement(data: PlacementCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if data.position not in POSITIONS:
        raise HTTPException(400, "Invalid position")
    sponsor = await db.get(Sponsor, data.sponsor_id)
    if not sponsor:
        raise HTTPException(404)
    await _check_sponsor_access(db, sponsor, user)
    if data.event_id and user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        await check_event_cap(db, data.event_id, user, "manage_events")
    p = SponsorPlacement(**data.model_dump())
    db.add(p)
    await db.commit()
    await db.refresh(p)
    return {"id": p.id}


@router.post("/placements/{placement_id}/click")
async def record_click(placement_id: int, db: AsyncSession = Depends(get_db)):
    p = await db.get(SponsorPlacement, placement_id)
    if not p or not p.is_active:
        raise HTTPException(404)
    p.clicks = (p.clicks or 0) + 1
    await db.commit()
    return {"clicks": p.clicks}


@admin_router.get("/analytics")
async def sponsor_analytics(user: User = Depends(require_role(*ADMIN_ROLES)), db: AsyncSession = Depends(get_db)):
    active = await db.scalar(select(func.count(Sponsor.id)).where(Sponsor.status == "ACTIVE"))
    total_value = await db.scalar(select(func.coalesce(func.sum(Sponsor.contract_value), 0)))
    impressions = await db.scalar(select(func.coalesce(func.sum(SponsorPlacement.impressions), 0)))
    clicks = await db.scalar(select(func.coalesce(func.sum(SponsorPlacement.clicks), 0)))
    return {
        "active_sponsors": active or 0,
        "contract_value_agreed": float(total_value or 0),
        "collected_revenue": 0,
        "impressions": impressions or 0,
        "clicks": clicks or 0,
        "note": "contract_value is agreed, not collected. No payment integration.",
    }


@public_router.get("")
async def public_sponsors(position: str = "HOMEPAGE", event_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    now = datetime.utcnow()
    q = select(SponsorPlacement, Sponsor).join(Sponsor, Sponsor.id == SponsorPlacement.sponsor_id).where(
        SponsorPlacement.position == position,
        SponsorPlacement.is_active == True,
        Sponsor.status == "ACTIVE",
    )
    if event_id:
        q = q.where(SponsorPlacement.event_id == event_id)
    result = await db.execute(q.order_by(SponsorPlacement.sort_order))
    out = []
    for placement, sponsor in result.all():
        if placement.ends_at and placement.ends_at < now:
            continue
        if placement.starts_at and placement.starts_at > now:
            continue
        placement.impressions = (placement.impressions or 0) + 1
        out.append({
            "id": sponsor.id,
            "name": sponsor.name,
            "logo_url": sponsor.logo_url,
            "website": sponsor.website,
            "level": sponsor.level,
            "placement_id": placement.id,
        })
    await db.commit()
    return out
