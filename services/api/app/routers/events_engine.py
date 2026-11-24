from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, func
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from typing import Optional, List
from app.database import get_db
from app.deps import get_current_user, require_role, get_org_member
from app.models.user import User, UserRole
from app.models.event import Event, EventStatus
from app.models.ticket import TicketType
from app.models.organization import OrganizationMember
from app.models.venue import Venue
from app.models.performer import Performer, EventPerformer, EventSchedule
from app.models.audit import AuditLog
from app.models.ticket import TicketType, Ticket
from app.models.order import Order, OrderItem, OrderStatus
from app.models.event import EventCategory
import re

public = APIRouter(prefix="/events", tags=["events-public"])
organizer = APIRouter(prefix="/organizer/events", tags=["events-organizer"])
admin = APIRouter(prefix="/admin/events", tags=["events-admin"])
venues_public = APIRouter(prefix="/venues", tags=["venues"])

def slugify(text: str) -> str:
    s = re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')
    return s or "event"

class EventCreate(BaseModel):
    title: str
    short_description: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    country_id: Optional[int] = None
    city_id: Optional[int] = None
    venue_id: Optional[int] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    start_at: datetime
    end_at: Optional[datetime] = None
    timezone: str = "Europe/Sarajevo"
    age_limit: Optional[int] = None
    entry_rules: Optional[str] = None
    cancellation_policy: Optional[str] = None
    contact_email: Optional[str] = None
    website: Optional[str] = None
    organization_id: int

class EventUpdate(BaseModel):
    title: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    venue_name: Optional[str] = None
    age_limit: Optional[int] = None
    entry_rules: Optional[str] = None
    cancellation_policy: Optional[str] = None

def event_to_public(e: Event) -> dict:
    return {
        "id": e.id, "title": e.title, "slug": e.slug,
        "short_description": e.short_description, "description": e.description,
        "city": e.city, "country": e.country, "venue_name": e.venue_name,
        "start_at": e.start_at, "end_at": e.end_at, "timezone": e.timezone,
        "image_url": e.image_url, "status": e.status, "is_featured": e.is_featured,
        "age_limit": e.age_limit
    }

async def audit(db, user_id, action, entity_id, details=None):
    db.add(AuditLog(user_id=user_id, action=action, entity_type="Event", entity_id=entity_id, details=details))

# ---------- Public ----------
@public.get("")
async def list_events(city: Optional[str] = None, category_id: Optional[int] = None, country_id: Optional[int] = None, page: int = Query(1, ge=1), limit: int = Query(20, le=100), db: AsyncSession = Depends(get_db)):
    q = select(Event).where(Event.status == EventStatus.PUBLISHED.value)
    if city:
        q = q.where(Event.city.ilike(f"%{city}%"))
    if category_id:
        q = q.where(Event.category_id == category_id)
    if country_id:
        q = q.where(Event.country_id == country_id)
    q = q.order_by(Event.start_at).offset((page - 1) * limit).limit(limit)
    result = await db.execute(q)
    return [event_to_public(e) for e in result.scalars().all()]

@public.get("/featured")
async def featured_events(limit: int = Query(10, le=50), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.status == EventStatus.PUBLISHED.value, Event.is_featured == True).order_by(Event.start_at).limit(limit))
    return [event_to_public(e) for e in result.scalars().all()]

@public.get("/upcoming")
async def upcoming_events(limit: int = Query(20, le=100), db: AsyncSession = Depends(get_db)):
    now = datetime.utcnow()
    result = await db.execute(select(Event).where(Event.status == EventStatus.PUBLISHED.value, Event.start_at >= now).order_by(Event.start_at).limit(limit))
    return [event_to_public(e) for e in result.scalars().all()]

@public.get("/search")
async def search_events(q: Optional[str] = None, city: Optional[str] = None, category_id: Optional[int] = None, date_from: Optional[datetime] = None, date_to: Optional[datetime] = None, page: int = Query(1, ge=1), limit: int = Query(20, le=100), db: AsyncSession = Depends(get_db)):
    query = select(Event).where(Event.status == EventStatus.PUBLISHED.value)
    if q:
        query = query.where(or_(Event.title.ilike(f"%{q}%"), Event.short_description.ilike(f"%{q}%")))
    if city:
        query = query.where(Event.city.ilike(f"%{city}%"))
    if category_id:
        query = query.where(Event.category_id == category_id)
    if date_from:
        query = query.where(Event.start_at >= date_from)
    if date_to:
        query = query.where(Event.start_at <= date_to)
    query = query.order_by(Event.start_at).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return [event_to_public(e) for e in result.scalars().all()]

@public.get("/slug/{slug}")
async def get_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.slug == slug))
    e = result.scalar_one_or_none()
    if not e or e.status not in (EventStatus.PUBLISHED.value,):
        raise HTTPException(status_code=404, detail="Event not found")
    return event_to_public(e)

@public.get("/{event_id}")
async def get_event(event_id: int, db: AsyncSession = Depends(get_db)):
    e = await db.get(Event, event_id)
    if not e or e.status != EventStatus.PUBLISHED.value:
        raise HTTPException(status_code=404, detail="Event not found")
    return event_to_public(e)


@public.get("/{event_id}/ticket-types")
async def public_ticket_types(event_id: int, db: AsyncSession = Depends(get_db)):
    """Public ticket types for an event. No auth required."""
    result = await db.execute(select(TicketType).where(TicketType.event_id == event_id, TicketType.is_active == True))
    types = result.scalars().all()
    return [{"id": t.id, "name": t.name, "price": float(t.price or 0), "currency": t.currency or "EUR", "available": (t.quantity_total or 0) - (t.quantity_sold or 0) - (t.quantity_reserved or 0)} for t in types]

@public.get("/{event_id}/performers")
async def event_performers(event_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EventPerformer).where(EventPerformer.event_id == event_id).order_by(EventPerformer.sort_order))
    return [{"id": ep.id, "performer_id": ep.performer_id, "role": ep.role, "sort_order": ep.sort_order} for ep in result.scalars().all()]

@public.get("/{event_id}/schedule")
async def event_schedule(event_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EventSchedule).where(EventSchedule.event_id == event_id).order_by(EventSchedule.start_at))
    return [{"id": s.id, "title": s.title, "start_at": s.start_at, "end_at": s.end_at} for s in result.scalars().all()]

@venues_public.get("")
async def list_venues(city_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    q = select(Venue).where(Venue.is_active == True)
    if city_id:
        q = q.where(Venue.city_id == city_id)
    result = await db.execute(q.order_by(Venue.name))
    return [{"id": v.id, "name": v.name, "address": v.address, "city_id": v.city_id, "capacity": v.capacity} for v in result.scalars().all()]

@venues_public.get("/{venue_id}")
async def get_venue(venue_id: int, db: AsyncSession = Depends(get_db)):
    v = await db.get(Venue, venue_id)
    if not v:
        raise HTTPException(status_code=404, detail="Venue not found")
    return {"id": v.id, "name": v.name, "address": v.address, "capacity": v.capacity, "venue_type": v.venue_type, "timezone": v.timezone}

# ---------- Organizer ----------
@organizer.post("")
async def create_event(data: EventCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    member = await get_org_member(data.organization_id, user, db)
    if not member and user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        raise HTTPException(status_code=403, detail="Not a member of this organization")
    slug = slugify(data.title)
    # ensure unique slug
    base = slug
    n = 1
    while (await db.execute(select(Event).where(Event.slug == slug))).scalar_one_or_none():
        slug = f"{base}-{n}"
        n += 1
    e = Event(
        organization_id=data.organization_id, title=data.title, slug=slug,
        short_description=data.short_description, description=data.description,
        category_id=data.category_id, subcategory_id=data.subcategory_id,
        country_id=data.country_id, city_id=data.city_id, venue_id=data.venue_id,
        venue_name=data.venue_name, venue_address=data.venue_address,
        start_at=data.start_at, end_at=data.end_at, timezone=data.timezone,
        age_limit=data.age_limit, entry_rules=data.entry_rules,
        cancellation_policy=data.cancellation_policy, contact_email=data.contact_email,
        website=data.website, status=EventStatus.DRAFT.value
    )
    db.add(e)
    await db.flush()
    await audit(db, user.id, "event_created", e.id, {"title": e.title})
    await db.commit()
    await db.refresh(e)
    return {"id": e.id, "slug": e.slug, "status": e.status}

@organizer.get("")
async def my_events(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # events from orgs the user belongs to
    result = await db.execute(
        select(Event).join(OrganizationMember, OrganizationMember.organization_id == Event.organization_id)
        .where(OrganizationMember.user_id == user.id)
        .order_by(Event.created_at.desc())
    )
    return [{"id": e.id, "title": e.title, "slug": e.slug, "status": e.status, "start_at": e.start_at, "organization_id": e.organization_id} for e in result.scalars().all()]

@organizer.get("/{event_id}")
async def get_my_event(event_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    e = await db.get(Event, event_id)
    if not e:
        raise HTTPException(status_code=404, detail="Event not found")
    member = await get_org_member(e.organization_id, user, db)
    if not member and user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        raise HTTPException(status_code=403, detail="Not authorized")
    return event_to_public(e) | {"status": e.status, "organization_id": e.organization_id}

@organizer.patch("/{event_id}")
async def update_event(event_id: int, data: EventUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    e = await db.get(Event, event_id)
    if not e:
        raise HTTPException(status_code=404, detail="Event not found")
    member = await get_org_member(e.organization_id, user, db)
    if not member and user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        raise HTTPException(status_code=403, detail="Not authorized")
    if e.status not in (EventStatus.DRAFT.value, EventStatus.SUBMITTED.value):
        raise HTTPException(status_code=400, detail="Cannot edit event in current status")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(e, field, value)
    await audit(db, user.id, "event_updated", e.id)
    await db.commit()
    return {"status": "updated"}

@organizer.post("/{event_id}/submit")
async def submit_event(event_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    e = await db.get(Event, event_id)
    if not e:
        raise HTTPException(status_code=404, detail="Event not found")
    member = await get_org_member(e.organization_id, user, db)
    if not member and user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        raise HTTPException(status_code=403, detail="Not authorized")
    if e.status != EventStatus.DRAFT.value:
        raise HTTPException(status_code=400, detail="Only draft events can be submitted")
    e.status = EventStatus.SUBMITTED.value
    await audit(db, user.id, "event_submitted", e.id)
    await db.commit()
    return {"status": e.status}

# ---------- Admin ----------
@admin.get("", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def admin_list_events(
    status: Optional[str] = None,
    q: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort: str = Query("start_at"),
    order: str = Query("desc"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Event)
    if status:
        query = query.where(Event.status == status)
    if q:
        term = f"%{q.strip()}%"
        org_ids = [r[0] for r in (await db.execute(select(Organization.id).where(Organization.name.ilike(term)))).all()]
        conds = [Event.title.ilike(term), Event.city.ilike(term)]
        if org_ids:
            conds.append(Event.organization_id.in_(org_ids))
        if q.strip().isdigit():
            conds.append(Event.id == int(q.strip()))
        query = query.where(or_(*conds))
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    col = {"id": Event.id, "title": Event.title, "start_at": Event.start_at, "created_at": Event.created_at, "status": Event.status}.get(sort, Event.start_at)
    query = query.order_by(col.asc() if order == "asc" else col.desc())
    events = (await db.execute(query.offset((page - 1) * page_size).limit(page_size))).scalars().all()
    org_map = {}
    if events:
        oids = list({e.organization_id for e in events})
        orgs = (await db.execute(select(Organization).where(Organization.id.in_(oids)))).scalars().all()
        org_map = {o.id: o.name for o in orgs}
    return {
        "total": total or 0, "page": page, "page_size": page_size,
        "items": [{
            "id": e.id, "title": e.title, "status": e.status, "city": e.city, "country": e.country,
            "organization_id": e.organization_id, "organization_name": org_map.get(e.organization_id),
            "start_at": e.start_at.isoformat() if e.start_at else None,
            "image_url": e.image_url,
        } for e in events],
    }


@admin.get("/{event_id}", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def admin_event_detail(event_id: int, db: AsyncSession = Depends(get_db)):
    e = await db.get(Event, event_id)
    if not e:
        raise HTTPException(404, "Event not found")
    org = await db.get(Organization, e.organization_id)
    cat = await db.get(EventCategory, e.category_id) if e.category_id else None
    types = (await db.execute(select(TicketType).where(TicketType.event_id == event_id))).scalars().all()
    capacity = sum(t.quantity_total or 0 for t in types)
    sold = sum(t.quantity_sold or 0 for t in types)
    available = sum(max(0, (t.quantity_total or 0) - (t.quantity_sold or 0) - (t.quantity_reserved or 0)) for t in types)
    orders = (await db.execute(
        select(Order).join(OrderItem, OrderItem.order_id == Order.id).join(TicketType, TicketType.id == OrderItem.ticket_type_id)
        .where(TicketType.event_id == event_id).distinct().order_by(Order.created_at.desc()).limit(20)
    )).scalars().all()
    revenue = sum(float(o.total_amount or 0) for o in orders if o.status == OrderStatus.PAID.value)
    history = (await db.execute(
        select(AuditLog).where(AuditLog.entity_id == event_id, AuditLog.entity_type.in_(["Event", "event"]))
        .order_by(AuditLog.created_at.desc()).limit(20)
    )).scalars().all()
    return {
        "id": e.id, "title": e.title, "slug": e.slug, "status": e.status,
        "short_description": e.short_description, "description": e.description,
        "city": e.city, "country": e.country, "venue_name": e.venue_name, "venue_address": e.venue_address,
        "start_at": e.start_at.isoformat() if e.start_at else None,
        "end_at": e.end_at.isoformat() if e.end_at else None,
        "timezone": e.timezone, "image_url": e.image_url, "gallery": e.gallery or [],
        "category": cat.name if cat else None,
        "organization": {"id": org.id, "name": org.name, "email": org.email} if org else None,
        "ticket_types": [{"id": t.id, "name": t.name, "price": float(t.price or 0), "quantity_total": t.quantity_total, "quantity_sold": t.quantity_sold, "quantity_reserved": t.quantity_reserved} for t in types],
        "capacity": capacity, "sold": sold, "available": available,
        "orders": [{"id": o.id, "reference": o.reference, "status": o.status, "total_amount": float(o.total_amount or 0), "created_at": o.created_at.isoformat() if o.created_at else None} for o in orders],
        "revenue": round(revenue, 2),
        "history": [{"id": h.id, "action": h.action, "user_id": h.user_id, "details": h.details, "created_at": h.created_at.isoformat() if h.created_at else None} for h in history],
    }


class EventAdminUpdate(BaseModel):
    title: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    image_url: Optional[str] = None


@admin.patch("/{event_id}", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def admin_update_event(event_id: int, data: EventAdminUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    e = await db.get(Event, event_id)
    if not e:
        raise HTTPException(404, "Event not found")
    changed = {}
    for field, value in data.model_dump(exclude_unset=True).items():
        old = getattr(e, field)
        if value != old:
            setattr(e, field, value)
            changed[field] = {"from": old, "to": value}
    if changed:
        await audit(db, user.id, "event_updated", e.id, changed)
        await db.commit()
    return {"id": e.id, "changed": list(changed.keys())}


@admin.post("/{event_id}/reject", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def reject_event(event_id: int, reason: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not reason or not reason.strip():
        raise HTTPException(400, "Reason required")
    e = await db.get(Event, event_id)
    if not e:
        raise HTTPException(404, "Event not found")
    if e.status != EventStatus.SUBMITTED.value:
        raise HTTPException(400, f"Cannot reject from {e.status}")
    e.status = EventStatus.DRAFT.value
    await audit(db, user.id, "event_rejected_to_draft", e.id, {"reason": reason.strip()})
    await db.commit()
    return {"id": e.id, "status": e.status, "note": "No REJECTED status in model. Returned to DRAFT with reason in audit."}

async def _transition(event_id: int, new_status: str, user: User, db: AsyncSession, allowed_from: list):
    e = await db.get(Event, event_id)
    if not e:
        raise HTTPException(status_code=404, detail="Event not found")
    if e.status not in allowed_from:
        raise HTTPException(status_code=400, detail=f"Cannot transition from {e.status} to {new_status}")
    e.status = new_status
    if new_status == EventStatus.PUBLISHED.value:
        e.is_published = True
        e.published_at = datetime.utcnow()
    if new_status in (EventStatus.SUSPENDED.value, EventStatus.CANCELLED.value):
        e.is_published = False
    await audit(db, user.id, f"event_{new_status.lower()}", e.id)
    await db.commit()
    return {"id": e.id, "status": e.status}

@admin.post("/{event_id}/approve", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def approve_event(event_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await _transition(event_id, EventStatus.APPROVED.value, user, db, [EventStatus.SUBMITTED.value])

@admin.post("/{event_id}/publish", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def publish_event(event_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await _transition(event_id, EventStatus.PUBLISHED.value, user, db, [EventStatus.APPROVED.value])

@admin.post("/{event_id}/suspend", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def suspend_event(event_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await _transition(event_id, EventStatus.SUSPENDED.value, user, db, [EventStatus.PUBLISHED.value])

@admin.post("/{event_id}/cancel", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def cancel_event(event_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await _transition(event_id, EventStatus.CANCELLED.value, user, db, [EventStatus.SUBMITTED.value, EventStatus.APPROVED.value, EventStatus.PUBLISHED.value, EventStatus.SUSPENDED.value])
