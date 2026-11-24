from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import re
from app.database import get_db
from app.deps import get_current_user, require_role, get_org_member
from app.models.user import User, UserRole
from app.models.organization import Organization, OrganizationMember, OrgRole
from app.models.event import Event, EventStatus
from app.models.ticket import TicketType, Ticket
from app.models.order import Order, OrderItem, OrderStatus
from app.models.ledger import LedgerEntry
from app.models.org_extended import OrgDocument, OrgNotification
from app.models.audit import AuditLog
from app.models.user_extended import UserFavorite

router = APIRouter(prefix="/organizer", tags=["organizer"])
admin_org = APIRouter(prefix="/admin/organizations", tags=["admin-organizations"])

REVIEWER_ROLES = (UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ORGANIZER_REVIEWER)

def slugify(text: str) -> str:
    s = re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')
    return s or "org"

class OrgCreate(BaseModel):
    name: str
    legal_form: Optional[str] = None
    country_id: Optional[int] = None
    registration_number: Optional[str] = None
    vat_number: Optional[str] = None
    address: Optional[str] = None
    city_id: Optional[int] = None
    postal_code: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    contact_person: Optional[str] = None
    org_type: str = "company"

class OrgUpdate(BaseModel):
    name: Optional[str] = None
    legal_form: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    contact_person: Optional[str] = None
    logo_url: Optional[str] = None

class TicketTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    currency: str = "EUR"
    quantity_total: int
    sale_start: Optional[datetime] = None
    sale_end: Optional[datetime] = None

class MemberInvite(BaseModel):
    email: str
    role: str = "staff"

async def audit(db, user_id, action, entity_type, entity_id, details=None):
    db.add(AuditLog(user_id=user_id, action=action, entity_type=entity_type, entity_id=entity_id, details=details))

async def notify(db, org_id, ntype, title, body=None, user_id=None):
    db.add(OrgNotification(organization_id=org_id, user_id=user_id, notification_type=ntype, title=title, body=body))

# ---------- Organizations ----------
@router.get("/organizations")
async def my_organizations(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Organization).join(OrganizationMember, OrganizationMember.organization_id == Organization.id)
        .where(OrganizationMember.user_id == user.id)
    )
    return [{"id": o.id, "name": o.name, "slug": o.slug, "verification_status": o.verification_status, "org_type": o.org_type} for o in result.scalars().all()]

@router.post("/organizations")
async def create_organization(data: OrgCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    slug = slugify(data.name)
    base = slug
    n = 1
    while (await db.execute(select(Organization).where(Organization.slug == slug))).scalar_one_or_none():
        slug = f"{base}-{n}"
        n += 1
    org = Organization(name=data.name, slug=slug, legal_form=data.legal_form, country_id=data.country_id, registration_number=data.registration_number, vat_number=data.vat_number, address=data.address, city_id=data.city_id, postal_code=data.postal_code, email=data.email, phone=data.phone, website=data.website, description=data.description, contact_person=data.contact_person, org_type=data.org_type, verification_status="NOT_SUBMITTED")
    db.add(org)
    await db.flush()
    db.add(OrganizationMember(user_id=user.id, organization_id=org.id, role=OrgRole.OWNER.value))
    await audit(db, user.id, "org_created", "Organization", org.id)
    await db.commit()
    await db.refresh(org)
    return {"id": org.id, "slug": org.slug, "verification_status": org.verification_status}

@router.get("/organizations/{org_id}")
async def get_organization(org_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    member = await get_org_member(org_id, user, db)
    if not member and user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        raise HTTPException(status_code=403, detail="Not a member")
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Not found")
    return {"id": org.id, "name": org.name, "slug": org.slug, "legal_form": org.legal_form, "registration_number": org.registration_number, "vat_number": org.vat_number, "address": org.address, "email": org.email, "phone": org.phone, "website": org.website, "description": org.description, "contact_person": org.contact_person, "org_type": org.org_type, "verification_status": org.verification_status, "is_verified": org.is_verified}

@router.patch("/organizations/{org_id}")
async def update_organization(org_id: int, data: OrgUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    member = await get_org_member(org_id, user, db)
    if not member or member.role not in (OrgRole.OWNER.value, OrgRole.ADMIN.value):
        raise HTTPException(status_code=403, detail="Insufficient role")
    org = await db.get(Organization, org_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(org, field, value)
    await audit(db, user.id, "org_updated", "Organization", org_id)
    await db.commit()
    return {"status": "updated"}

@router.get("/organizations/{org_id}/verification")
async def get_verification(org_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    member = await get_org_member(org_id, user, db)
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")
    org = await db.get(Organization, org_id)
    docs = (await db.execute(select(OrgDocument).where(OrgDocument.organization_id == org_id))).scalars().all()
    return {"verification_status": org.verification_status, "submitted_at": org.verification_submitted_at, "verified_at": org.verified_at, "rejection_reason": org.rejection_reason, "documents_count": len(docs)}

@router.post("/organizations/{org_id}/verification/submit")
async def submit_verification(org_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    member = await get_org_member(org_id, user, db)
    if not member or member.role not in (OrgRole.OWNER.value, OrgRole.ADMIN.value):
        raise HTTPException(status_code=403, detail="Insufficient role")
    org = await db.get(Organization, org_id)
    org.verification_status = "PENDING_REVIEW"
    org.verification_submitted_at = datetime.utcnow()
    await audit(db, user.id, "verification_submitted", "Organization", org_id)
    await notify(db, org_id, "verification_submitted", "Verification submitted")
    await db.commit()
    return {"verification_status": org.verification_status}

# ---------- Dashboard ----------
@router.get("/dashboard")
async def dashboard(org_id: int = Query(...), user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    member = await get_org_member(org_id, user, db)
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")
    events = (await db.execute(select(Event).where(Event.organization_id == org_id))).scalars().all()
    by_status = {}
    for e in events:
        by_status[e.status] = by_status.get(e.status, 0) + 1
    members_count = (await db.execute(select(func.count(OrganizationMember.id)).where(OrganizationMember.organization_id == org_id))).scalar()
    favs = (await db.execute(select(func.count(UserFavorite.id)).join(Event, Event.id == UserFavorite.event_id).where(Event.organization_id == org_id))).scalar()
    return {
        "total_events": len(events),
        "by_status": by_status,
        "members": members_count,
        "favorites": favs,
        "finance": {"available": False, "message": "Sales data not yet available"}
    }

# ---------- Members ----------
@router.get("/members")
async def list_members(org_id: int = Query(...), user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    member = await get_org_member(org_id, user, db)
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")
    result = await db.execute(select(OrganizationMember).where(OrganizationMember.organization_id == org_id))
    return [{"id": m.id, "user_id": m.user_id, "role": m.role} for m in result.scalars().all()]

@router.post("/members/invite")
async def invite_member(data: MemberInvite, org_id: int = Query(...), user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    member = await get_org_member(org_id, user, db)
    if not member or member.role not in (OrgRole.OWNER.value, OrgRole.ADMIN.value):
        raise HTTPException(status_code=403, detail="Insufficient role")
    target = (await db.execute(select(User).where(User.email == data.email))).scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    existing = (await db.execute(select(OrganizationMember).where(OrganizationMember.organization_id == org_id, OrganizationMember.user_id == target.id))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Already a member")
    db.add(OrganizationMember(user_id=target.id, organization_id=org_id, role=data.role))
    await audit(db, user.id, "member_invited", "Organization", org_id, {"email": data.email, "role": data.role})
    await notify(db, org_id, "member_invited", f"Invited {data.email}", user_id=target.id)
    await db.commit()
    return {"status": "invited"}

@router.patch("/members/{member_id}")
async def change_role(member_id: int, role: str, org_id: int = Query(...), user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    caller = await get_org_member(org_id, user, db)
    if not caller or caller.role != OrgRole.OWNER.value:
        raise HTTPException(status_code=403, detail="Only OWNER can change roles")
    target = await db.get(OrganizationMember, member_id)
    if not target or target.organization_id != org_id:
        raise HTTPException(status_code=404, detail="Member not found")
    target.role = role
    await audit(db, user.id, "role_changed", "OrganizationMember", member_id, {"new_role": role})
    await db.commit()
    return {"status": "updated"}

@router.delete("/members/{member_id}")
async def remove_member(member_id: int, org_id: int = Query(...), user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    caller = await get_org_member(org_id, user, db)
    if not caller or caller.role not in (OrgRole.OWNER.value, OrgRole.ADMIN.value):
        raise HTTPException(status_code=403, detail="Insufficient role")
    target = await db.get(OrganizationMember, member_id)
    if not target or target.organization_id != org_id:
        raise HTTPException(status_code=404, detail="Member not found")
    if target.role == OrgRole.OWNER.value:
        owners = (await db.execute(select(func.count(OrganizationMember.id)).where(OrganizationMember.organization_id == org_id, OrganizationMember.role == OrgRole.OWNER.value))).scalar()
        if owners <= 1:
            raise HTTPException(status_code=400, detail="Cannot remove the last OWNER")
    await db.delete(target)
    await audit(db, user.id, "member_removed", "OrganizationMember", member_id)
    await db.commit()
    return {"status": "removed"}

# ---------- Ticket Types ----------
@router.get("/events/{event_id}/ticket-types")
async def list_ticket_types(event_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    e = await db.get(Event, event_id)
    if not e:
        raise HTTPException(status_code=404, detail="Event not found")
    member = await get_org_member(e.organization_id, user, db)
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")
    result = await db.execute(select(TicketType).where(TicketType.event_id == event_id))
    return [{"id": t.id, "name": t.name, "price": float(t.price), "currency": t.currency, "quantity_total": t.quantity_total, "is_active": t.is_active} for t in result.scalars().all()]

@router.post("/events/{event_id}/ticket-types")
async def create_ticket_type(event_id: int, data: TicketTypeCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    e = await db.get(Event, event_id)
    if not e:
        raise HTTPException(status_code=404, detail="Event not found")
    member = await get_org_member(e.organization_id, user, db)
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")
    if data.price < 0 or data.quantity_total < 0:
        raise HTTPException(status_code=400, detail="Invalid price or quantity")
    t = TicketType(event_id=event_id, name=data.name, description=data.description, price=data.price, currency=data.currency.upper()[:3], quantity_total=data.quantity_total, sale_start=data.sale_start, sale_end=data.sale_end)
    db.add(t)
    await db.flush()
    # Auto-create inventory row (idempotent via unique ticket_type_id)
    from app.models.inventory import TicketInventory
    existing_inv = await db.execute(select(TicketInventory).where(TicketInventory.ticket_type_id == t.id))
    if not existing_inv.scalar_one_or_none():
        db.add(TicketInventory(
            ticket_type_id=t.id,
            available=data.quantity_total,
            reserved=0,
            sold=0,
            version=0,
        ))
    await audit(db, user.id, "ticket_type_created", "TicketType", t.id, {"quantity": data.quantity_total})
    await db.commit()
    await db.refresh(t)
    return {"id": t.id, "name": t.name, "quantity_total": t.quantity_total}

# ---------- Reports ----------
@router.get("/reports/events")
async def report_events(org_id: int = Query(...), user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    member = await get_org_member(org_id, user, db)
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")
    events = (await db.execute(select(Event).where(Event.organization_id == org_id))).scalars().all()
    by_status = {}
    for e in events:
        by_status[e.status] = by_status.get(e.status, 0) + 1
    return {"total": len(events), "by_status": by_status}

@router.get("/reports/finance")
async def report_finance(org_id: int = Query(...), user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    member = await get_org_member(org_id, user, db)
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")
    return {"available": False, "message": "No sales data available. Ledger records are the source of truth when sales begin.", "gross": None, "platform_fee": None, "net": None}

# ---------- Admin verification ----------
@admin_org.get("", dependencies=[Depends(require_role(*REVIEWER_ROLES))])
async def admin_list_orgs(
    status: Optional[str] = None,
    q: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort: str = Query("created_at"),
    order: str = Query("desc"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Organization)
    if status == "pending":
        query = query.where(Organization.verification_status.in_(["SUBMITTED", "PENDING_REVIEW"]))
    elif status:
        query = query.where(Organization.verification_status == status)
    if q:
        term = f"%{q.strip()}%"
        conds = [Organization.name.ilike(term), Organization.email.ilike(term)]
        if q.strip().isdigit():
            conds.append(Organization.id == int(q.strip()))
        query = query.where(or_(*conds))
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    col = {"id": Organization.id, "name": Organization.name, "created_at": Organization.created_at}.get(sort, Organization.created_at)
    query = query.order_by(col.asc() if order == "asc" else col.desc())
    orgs = (await db.execute(query.offset((page - 1) * page_size).limit(page_size))).scalars().all()
    return {
        "total": total or 0,
        "page": page,
        "page_size": page_size,
        "items": [{
            "id": o.id, "name": o.name, "slug": o.slug, "email": o.email,
            "verification_status": o.verification_status, "is_active": o.is_active,
            "contact_person": o.contact_person, "created_at": o.created_at.isoformat() if o.created_at else None,
        } for o in orgs],
    }


@admin_org.get("/{org_id}", dependencies=[Depends(require_role(*REVIEWER_ROLES))])
async def admin_org_full(org_id: int, db: AsyncSession = Depends(get_db)):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(404, "Organization not found")
    members = (await db.execute(select(OrganizationMember).where(OrganizationMember.organization_id == org_id))).scalars().all()
    events = (await db.execute(select(Event).where(Event.organization_id == org_id).order_by(Event.start_at.desc()))).scalars().all()
    event_ids = [e.id for e in events]
    orders, tickets_sold, revenue = [], 0, 0.0
    if event_ids:
        order_rows = (await db.execute(
            select(Order).join(OrderItem, OrderItem.order_id == Order.id)
            .join(TicketType, TicketType.id == OrderItem.ticket_type_id)
            .where(TicketType.event_id.in_(event_ids))
            .distinct()
            .order_by(Order.created_at.desc())
            .limit(20)
        )).scalars().all()
        orders = order_rows
        paid = [o for o in order_rows if o.status == OrderStatus.PAID.value]
        revenue = sum(float(o.total_amount or 0) for o in paid)
        tickets_sold = await db.scalar(
            select(func.count(Ticket.id)).join(TicketType, Ticket.ticket_type_id == TicketType.id)
            .where(TicketType.event_id.in_(event_ids))
        ) or 0
    fee = await db.scalar(select(func.coalesce(func.sum(LedgerEntry.amount), 0)).where(
        LedgerEntry.organization_id == org_id, LedgerEntry.entry_type == "platform_fee"
    )) or 0
    history = (await db.execute(
        select(AuditLog).where(AuditLog.entity_id == org_id, AuditLog.entity_type.in_(["Organization", "organization"]))
        .order_by(AuditLog.created_at.desc()).limit(20)
    )).scalars().all()
    return {
        "id": org.id, "name": org.name, "slug": org.slug, "email": org.email, "phone": org.phone,
        "legal_form": org.legal_form, "registration_number": org.registration_number, "vat_number": org.vat_number,
        "address": org.address, "postal_code": org.postal_code, "website": org.website, "description": org.description,
        "contact_person": org.contact_person, "org_type": org.org_type,
        "verification_status": org.verification_status, "is_active": org.is_active, "is_verified": org.is_verified,
        "rejection_reason": org.rejection_reason,
        "created_at": org.created_at.isoformat() if org.created_at else None,
        "verified_at": org.verified_at.isoformat() if org.verified_at else None,
        "members": [{"user_id": m.user_id, "role": m.role} for m in members],
        "events": [{"id": e.id, "title": e.title, "status": e.status, "start_at": e.start_at.isoformat() if e.start_at else None} for e in events],
        "orders": [{"id": o.id, "reference": o.reference, "status": o.status, "total_amount": float(o.total_amount or 0), "created_at": o.created_at.isoformat() if o.created_at else None} for o in orders],
        "tickets_sold": tickets_sold,
        "revenue": round(revenue, 2),
        "platform_fee": float(fee),
        "net": round(revenue - float(fee), 2),
        "history": [{"id": h.id, "action": h.action, "user_id": h.user_id, "details": h.details, "created_at": h.created_at.isoformat() if h.created_at else None} for h in history],
    }


@admin_org.post("/{org_id}/activate", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def activate_org(org_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(404, "Organization not found")
    org.is_active = True
    if org.verification_status == "SUSPENDED":
        org.verification_status = "VERIFIED" if org.is_verified else "NOT_SUBMITTED"
    await audit(db, user.id, "org_activated", "Organization", org_id)
    await db.commit()
    return {"id": org.id, "is_active": True, "verification_status": org.verification_status}


@admin_org.post("/{org_id}/deactivate", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def deactivate_org(org_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(404, "Organization not found")
    org.is_active = False
    await audit(db, user.id, "org_deactivated", "Organization", org_id)
    await db.commit()
    return {"id": org.id, "is_active": False}

@admin_org.post("/{org_id}/approve", dependencies=[Depends(require_role(*REVIEWER_ROLES))])
async def approve_org(org_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Not found")
    org.verification_status = "VERIFIED"
    org.is_verified = True
    org.verified_at = datetime.utcnow()
    org.verified_by = user.id
    await audit(db, user.id, "org_verified", "Organization", org_id)
    await notify(db, org_id, "verification_approved", "Organization verified")
    await db.commit()
    return {"verification_status": org.verification_status}

@admin_org.post("/{org_id}/reject", dependencies=[Depends(require_role(*REVIEWER_ROLES))])
async def reject_org(org_id: int, reason: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Not found")
    org.verification_status = "REJECTED"
    org.rejection_reason = reason
    await audit(db, user.id, "org_rejected", "Organization", org_id, {"reason": reason})
    await notify(db, org_id, "verification_rejected", "Verification rejected", reason)
    await db.commit()
    return {"verification_status": org.verification_status}

@admin_org.post("/{org_id}/suspend", dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))])
async def suspend_org(org_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Not found")
    org.verification_status = "SUSPENDED"
    org.is_active = False
    await audit(db, user.id, "org_suspended", "Organization", org_id)
    await db.commit()
    return {"verification_status": org.verification_status}

from fastapi.responses import StreamingResponse
import csv, io

@router.get("/events/{event_id}/attendees")
async def list_attendees(
    event_id: int,
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    status: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Ownership check
    member = await get_org_member_for_event(event_id, user, db)
    if not member:
        raise HTTPException(403, "Not authorized for this event")
    # Query tickets for this event via ticket types
    q = select(Ticket).join(TicketType).where(TicketType.event_id == event_id)
    if status:
        q = q.where(Ticket.is_used == (status == "used"))
    result = await db.execute(q.offset((page-1)*page_size).limit(page_size))
    tickets = result.scalars().all()
    items = []
    for t in tickets:
        items.append({
            "ticket_id": t.id,
            "code": t.code[:8] + "...",  # partial for privacy
            "is_used": t.is_used,
            "used_at": t.used_at.isoformat() if t.used_at else None,
            "status": "used" if t.is_used else "valid"
        })
    return {"items": items, "page": page, "page_size": page_size, "total": len(items)}

@router.get("/events/{event_id}/attendees/export")
async def export_attendees(
    event_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    member = await get_org_member_for_event(event_id, user, db)
    if not member or member.role not in ("owner", "admin", "event_manager", "sales_manager"):
        raise HTTPException(403, "Insufficient role for export")
    result = await db.execute(select(Ticket).join(TicketType).where(TicketType.event_id == event_id))
    tickets = result.scalars().all()
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["ticket_id", "code_partial", "is_used", "used_at"])
    for t in tickets:
        w.writerow([t.id, t.code[:8]+"...", t.is_used, t.used_at])
    await audit(db, user.id, "attendees_export", "Event", event_id)
    await db.commit()
    buf.seek(0)
    return StreamingResponse(buf, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=attendees_{event_id}.csv"})

async def get_org_member_for_event(event_id: int, user: User, db: AsyncSession):
    from app.models.event import Event
    event = await db.get(Event, event_id)
    if not event:
        return None
    result = await db.execute(select(OrganizationMember).where(
        OrganizationMember.organization_id == event.organization_id,
        OrganizationMember.user_id == user.id
    ))
    return result.scalar_one_or_none()
