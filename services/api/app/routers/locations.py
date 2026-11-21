from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import Optional
from app.database import get_db
from app.deps import require_role
from app.models.user import UserRole
from app.models.location import Country, City, Region
from app.models.event import EventCategory

router = APIRouter(prefix="/locations", tags=["locations"])
categories_router = APIRouter(prefix="/categories", tags=["categories"])

# ---------- Public ----------
@router.get("/countries")
async def list_countries(active_only: bool = True, db: AsyncSession = Depends(get_db)):
    q = select(Country)
    if active_only:
        q = q.where(Country.is_active == True)
    result = await db.execute(q.order_by(Country.name_en))
    return [{"id": c.id, "iso_alpha2": c.iso_alpha2, "iso_alpha3": c.iso_alpha3, "name_en": c.name_en, "name_local": c.name_local, "phone_code": c.phone_code, "currency_code": c.currency_code} for c in result.scalars().all()]

@router.get("/countries/{country_id}")
async def get_country(country_id: int, db: AsyncSession = Depends(get_db)):
    c = await db.get(Country, country_id)
    if not c:
        raise HTTPException(status_code=404, detail="Country not found")
    return {"id": c.id, "iso_alpha2": c.iso_alpha2, "iso_alpha3": c.iso_alpha3, "name_en": c.name_en, "name_local": c.name_local, "phone_code": c.phone_code, "currency_code": c.currency_code, "is_active": c.is_active}

@router.get("/countries/{country_id}/cities")
async def cities_by_country(country_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(City).where(City.country_id == country_id, City.is_active == True).order_by(City.name))
    return [{"id": ci.id, "name": ci.name, "name_alt": ci.name_alt, "timezone": ci.timezone, "latitude": str(ci.latitude) if ci.latitude else None, "longitude": str(ci.longitude) if ci.longitude else None} for ci in result.scalars().all()]

@router.get("/cities")
async def search_cities(q: Optional[str] = None, country_id: Optional[int] = None, limit: int = Query(50, le=200), db: AsyncSession = Depends(get_db)):
    query = select(City).where(City.is_active == True)
    if country_id:
        query = query.where(City.country_id == country_id)
    if q:
        query = query.where(or_(City.name.ilike(f"%{q}%"), City.name_alt.ilike(f"%{q}%")))
    result = await db.execute(query.order_by(City.name).limit(limit))
    return [{"id": ci.id, "name": ci.name, "country_id": ci.country_id, "timezone": ci.timezone} for ci in result.scalars().all()]

@router.get("/regions")
async def list_regions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Region).where(Region.is_active == True).order_by(Region.name_en))
    return [{"id": r.id, "code": r.code, "name_en": r.name_en, "description": r.description} for r in result.scalars().all()]

@categories_router.get("")
async def list_categories(parent_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    q = select(EventCategory).where(EventCategory.is_active == True)
    if parent_id is not None:
        q = q.where(EventCategory.parent_id == parent_id)
    else:
        q = q.where(EventCategory.parent_id == None)
    result = await db.execute(q.order_by(EventCategory.sort_order, EventCategory.name))
    return [{"id": c.id, "name": c.name, "slug": c.slug, "parent_id": c.parent_id, "icon": c.icon, "sort_order": c.sort_order, "name_local": c.name_local} for c in result.scalars().all()]

@categories_router.get("/{category_id}")
async def get_category(category_id: int, db: AsyncSession = Depends(get_db)):
    c = await db.get(EventCategory, category_id)
    if not c:
        raise HTTPException(status_code=404, detail="Category not found")
    children = (await db.execute(select(EventCategory).where(EventCategory.parent_id == category_id, EventCategory.is_active == True))).scalars().all()
    return {"id": c.id, "name": c.name, "slug": c.slug, "description": c.description, "icon": c.icon, "parent_id": c.parent_id, "children": [{"id": ch.id, "name": ch.name, "slug": ch.slug} for ch in children]}

# ---------- Admin (RBAC) ----------
admin_router = APIRouter(prefix="/admin/locations", tags=["admin-locations"])

@admin_router.post("/countries", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def admin_create_country(data: dict, db: AsyncSession = Depends(get_db)):
    # Minimal admin create – full validation in later phase
    c = Country(iso_alpha2=data["iso_alpha2"], iso_alpha3=data["iso_alpha3"], name_en=data["name_en"], name_local=data.get("name_local"), phone_code=data.get("phone_code"), currency_code=data.get("currency_code"))
    db.add(c)
    await db.commit()
    await db.refresh(c)
    return {"id": c.id}
