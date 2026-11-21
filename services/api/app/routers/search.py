"""CORE 1D: Advanced search, filters, popular ranking.

Popularity ranking (documented):
1. Featured events first
2. Then by favorite count (UserFavorite)
3. Then by start_at ascending (sooner first)
No fabricated view/sale counts. Only PUBLISHED events.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, case
from datetime import datetime, timedelta
from typing import Optional
import unicodedata
from app.database import get_db
from app.models.event import Event, EventStatus
from app.models.performer import Performer, EventPerformer
from app.models.venue import Venue
from app.models.organization import Organization
from app.models.user_extended import UserFavorite

router = APIRouter(prefix="/events", tags=["search"])

def normalize(s: str) -> str:
    if not s:
        return ""
    n = unicodedata.normalize("NFKD", s)
    return "".join(c for c in n if not unicodedata.combining(c)).lower()

def event_to_dict(e: Event) -> dict:
    return {
        "id": e.id, "title": e.title, "slug": e.slug,
        "short_description": e.short_description, "city": e.city, "country": e.country,
        "venue_name": e.venue_name, "start_at": e.start_at, "end_at": e.end_at,
        "timezone": e.timezone, "image_url": e.image_url, "is_featured": e.is_featured,
        "status": e.status
    }

@router.get("/search")
async def advanced_search(
    q: Optional[str] = None,
    country_id: Optional[int] = None,
    city_id: Optional[int] = None,
    city: Optional[str] = None,
    category_id: Optional[int] = None,
    subcategory_id: Optional[int] = None,
    venue_id: Optional[int] = None,
    organizer_id: Optional[int] = None,
    performer: Optional[str] = None,
    date_preset: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    free_only: Optional[bool] = None,
    multi_day: Optional[bool] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db)
):
    query = select(Event).where(Event.status == EventStatus.PUBLISHED.value)

    if q:
        nq = normalize(q)
        query = query.where(or_(
            func.lower(Event.title).contains(nq),
            func.lower(Event.short_description).contains(nq),
            func.lower(Event.description).contains(nq)
        ))
    if country_id:
        query = query.where(Event.country_id == country_id)
    if city_id:
        query = query.where(Event.city_id == city_id)
    if city:
        query = query.where(func.lower(Event.city).contains(normalize(city)))
    if category_id:
        query = query.where(Event.category_id == category_id)
    if subcategory_id:
        query = query.where(Event.subcategory_id == subcategory_id)
    if venue_id:
        query = query.where(Event.venue_id == venue_id)
    if organizer_id:
        query = query.where(Event.organization_id == organizer_id)

    now = datetime.utcnow()
    if date_preset == "today":
        query = query.where(and_(Event.start_at >= now.replace(hour=0, minute=0, second=0), Event.start_at < now.replace(hour=0, minute=0, second=0) + timedelta(days=1)))
    elif date_preset == "tomorrow":
        t = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0)
        query = query.where(and_(Event.start_at >= t, Event.start_at < t + timedelta(days=1)))
    elif date_preset == "weekend":
        days_ahead = (5 - now.weekday()) % 7
        sat = (now + timedelta(days=days_ahead)).replace(hour=0, minute=0, second=0)
        query = query.where(and_(Event.start_at >= sat, Event.start_at < sat + timedelta(days=2)))
    elif date_preset == "next7":
        query = query.where(and_(Event.start_at >= now, Event.start_at < now + timedelta(days=7)))
    elif date_preset == "next30":
        query = query.where(and_(Event.start_at >= now, Event.start_at < now + timedelta(days=30)))
    elif date_preset == "thismonth":
        start = now.replace(day=1, hour=0, minute=0, second=0)
        if now.month == 12:
            end = start.replace(year=now.year + 1, month=1)
        else:
            end = start.replace(month=now.month + 1)
        query = query.where(and_(Event.start_at >= start, Event.start_at < end))
    if date_from:
        query = query.where(Event.start_at >= date_from)
    if date_to:
        query = query.where(Event.start_at <= date_to)

    if multi_day is True:
        query = query.where(Event.end_at.isnot(None), Event.end_at > Event.start_at + timedelta(days=1))
    elif multi_day is False:
        query = query.where(or_(Event.end_at.is_(None), Event.end_at <= Event.start_at + timedelta(days=1)))

    if performer:
        np = normalize(performer)
        query = query.join(EventPerformer, EventPerformer.event_id == Event.id).join(Performer, Performer.id == EventPerformer.performer_id).where(func.lower(Performer.name).contains(np))

    query = query.order_by(Event.start_at).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    events = result.scalars().unique().all()
    return {"results": [event_to_dict(e) for e in events], "page": page, "limit": limit, "count": len(events)}

@router.get("/popular")
async def popular_events(limit: int = Query(10, le=50), db: AsyncSession = Depends(get_db)):
    fav_count = select(func.count(UserFavorite.id)).where(UserFavorite.event_id == Event.id).correlate(Event).scalar_subquery()
    result = await db.execute(
        select(Event)
        .where(Event.status == EventStatus.PUBLISHED.value, Event.start_at >= datetime.utcnow())
        .order_by(Event.is_featured.desc(), fav_count.desc(), Event.start_at)
        .limit(limit)
    )
    return {"results": [event_to_dict(e) for e in result.scalars().all()], "ranking": "featured > favorites > start_at"}
