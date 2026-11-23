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
    country: Optional[str] = None,
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
    if country:
        query = query.where(func.lower(Event.country).contains(normalize(country)))
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


@router.get("/discover")
async def discover(db: AsyncSession = Depends(get_db)):
    """Discovery sections from real published events. Empty sections stay empty."""
    now = datetime.utcnow()
    published = Event.status == EventStatus.PUBLISHED.value
    upcoming = and_(published, Event.start_at >= now)

    upcoming_q = await db.execute(select(Event).where(upcoming).order_by(Event.start_at).limit(12))
    featured_q = await db.execute(select(Event).where(and_(upcoming, Event.is_featured == True)).order_by(Event.start_at).limit(8))
    weekend_start = now + timedelta(days=(5 - now.weekday()) % 7)
    weekend_q = await db.execute(
        select(Event).where(and_(upcoming, Event.start_at >= weekend_start.replace(hour=0, minute=0, second=0), Event.start_at < weekend_start.replace(hour=0, minute=0, second=0) + timedelta(days=2))).limit(8)
    )
    recent_q = await db.execute(select(Event).where(published).order_by(Event.created_at.desc()).limit(8))

    cities = await db.execute(
        select(Event.city, func.count(Event.id)).where(upcoming, Event.city.isnot(None)).group_by(Event.city).order_by(func.count(Event.id).desc()).limit(10)
    )
    return {
        "popular": [event_to_dict(e) for e in featured_q.scalars()],
        "upcoming": [event_to_dict(e) for e in upcoming_q.scalars()],
        "this_weekend": [event_to_dict(e) for e in weekend_q.scalars()],
        "recently_added": [event_to_dict(e) for e in recent_q.scalars()],
        "top_cities": [{"city": c, "count": n} for c, n in cities.all()],
        "note": "Only published events. Empty when no data.",
    }


@router.get("/autocomplete")
async def autocomplete(q: str = Query(..., min_length=2), db: AsyncSession = Depends(get_db)):
    nq = normalize(q)
    result = await db.execute(
        select(Event.title, Event.slug, Event.city)
        .where(Event.status == EventStatus.PUBLISHED.value, func.lower(Event.title).contains(nq))
        .order_by(Event.start_at)
        .limit(8)
    )
    return [{"title": r[0], "slug": r[1], "city": r[2]} for r in result.all()]


@router.get("/sitemap.xml")
async def sitemap(db: AsyncSession = Depends(get_db)):
    from fastapi.responses import Response
    result = await db.execute(select(Event.slug).where(Event.status == EventStatus.PUBLISHED.value))
    urls = "".join(f"<url><loc>/events/{s}</loc></url>" for (s,) in result.all())
    xml = f'<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>'
    return Response(content=xml, media_type="application/xml")
