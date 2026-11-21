from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional
import re
from app.database import get_db
from app.deps import require_role, get_current_user
from app.models.user import User, UserRole
from app.models.venue import Venue
from app.models.performer import Performer
from app.models.event import Event
from app.models.audit import AuditLog

venues = APIRouter(prefix="/admin/venues", tags=["admin-venues"])
performers = APIRouter(prefix="/admin/performers", tags=["admin-performers"])
public_performers = APIRouter(prefix="/performers", tags=["performers"])

def slugify(text: str) -> str:
    s = re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')
    return s or "item"

class VenueCreate(BaseModel):
    name: str
    country_id: Optional[int] = None
    city_id: Optional[int] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity: Optional[int] = None
    venue_type: Optional[str] = None
    website: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    timezone: Optional[str] = None

class VenueUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    capacity: Optional[int] = None
    is_active: Optional[bool] = None
    website: Optional[str] = None

class PerformerCreate(BaseModel):
    name: str
    performer_type: str
    bio: Optional[str] = None
    image_url: Optional[str] = None
    website: Optional[str] = None
    country_id: Optional[int] = None
    social_links: Optional[dict] = None

class PerformerUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    image_url: Optional[str] = None
    website: Optional[str] = None
    is_active: Optional[bool] = None

async def audit(db, user_id, action, entity_type, entity_id):
    db.add(AuditLog(user_id=user_id, action=action, entity_type=entity_type, entity_id=entity_id))

# ---------- Admin Venues ----------
@venues.post("", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def create_venue(data: VenueCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    existing = (await db.execute(select(Venue).where(func.lower(Venue.name) == data.name.lower(), Venue.city_id == data.city_id))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Venue with this name already exists in the city")
    v = Venue(**data.model_dump())
    db.add(v)
    await db.flush()
    await audit(db, user.id, "venue_created", "Venue", v.id)
    await db.commit()
    await db.refresh(v)
    return {"id": v.id, "name": v.name}

@venues.get("", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def admin_list_venues(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Venue).order_by(Venue.name))
    return [{"id": v.id, "name": v.name, "is_active": v.is_active, "city_id": v.city_id} for v in result.scalars().all()]

@venues.patch("/{venue_id}", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def update_venue(venue_id: int, data: VenueUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    v = await db.get(Venue, venue_id)
    if not v:
        raise HTTPException(status_code=404, detail="Venue not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(v, field, value)
    await audit(db, user.id, "venue_updated", "Venue", v.id)
    await db.commit()
    return {"status": "updated"}

@venues.delete("/{venue_id}", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def deactivate_venue(venue_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    v = await db.get(Venue, venue_id)
    if not v:
        raise HTTPException(status_code=404, detail="Venue not found")
    linked = (await db.execute(select(func.count(Event.id)).where(Event.venue_id == venue_id))).scalar()
    if linked and linked > 0:
        v.is_active = False
        await audit(db, user.id, "venue_deactivated", "Venue", v.id)
        await db.commit()
        return {"status": "deactivated", "reason": "has linked events"}
    v.is_active = False
    await audit(db, user.id, "venue_deactivated", "Venue", v.id)
    await db.commit()
    return {"status": "deactivated"}

# ---------- Admin Performers ----------
@performers.post("", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def create_performer(data: PerformerCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    slug = slugify(data.name)
    base = slug
    n = 1
    while (await db.execute(select(Performer).where(Performer.slug == slug))).scalar_one_or_none():
        slug = f"{base}-{n}"
        n += 1
    p = Performer(name=data.name, slug=slug, performer_type=data.performer_type, bio=data.bio, image_url=data.image_url, website=data.website, country_id=data.country_id, social_links=data.social_links)
    db.add(p)
    await db.flush()
    await audit(db, user.id, "performer_created", "Performer", p.id)
    await db.commit()
    await db.refresh(p)
    return {"id": p.id, "slug": p.slug}

@performers.get("", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def admin_list_performers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Performer).order_by(Performer.name))
    return [{"id": p.id, "name": p.name, "slug": p.slug, "performer_type": p.performer_type, "is_active": p.is_active} for p in result.scalars().all()]

@performers.patch("/{performer_id}", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def update_performer(performer_id: int, data: PerformerUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    p = await db.get(Performer, performer_id)
    if not p:
        raise HTTPException(status_code=404, detail="Performer not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(p, field, value)
    await audit(db, user.id, "performer_updated", "Performer", p.id)
    await db.commit()
    return {"status": "updated"}

@performers.delete("/{performer_id}", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def deactivate_performer(performer_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    p = await db.get(Performer, performer_id)
    if not p:
        raise HTTPException(status_code=404, detail="Performer not found")
    p.is_active = False
    await audit(db, user.id, "performer_deactivated", "Performer", p.id)
    await db.commit()
    return {"status": "deactivated"}

# ---------- Public Performers ----------
@public_performers.get("")
async def list_performers(q: Optional[str] = None, performer_type: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    query = select(Performer).where(Performer.is_active == True)
    if q:
        query = query.where(func.lower(Performer.name).contains(q.lower()))
    if performer_type:
        query = query.where(Performer.performer_type == performer_type)
    result = await db.execute(query.order_by(Performer.name).limit(100))
    return [{"id": p.id, "name": p.name, "slug": p.slug, "performer_type": p.performer_type, "image_url": p.image_url} for p in result.scalars().all()]

@public_performers.get("/{performer_id}")
async def get_performer(performer_id: int, db: AsyncSession = Depends(get_db)):
    p = await db.get(Performer, performer_id)
    if not p or not p.is_active:
        raise HTTPException(status_code=404, detail="Performer not found")
    return {"id": p.id, "name": p.name, "slug": p.slug, "performer_type": p.performer_type, "bio": p.bio, "image_url": p.image_url, "website": p.website}
