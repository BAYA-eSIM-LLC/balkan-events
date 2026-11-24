from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.deps import get_current_user, require_role
from app.models.user import User, UserRole, ADMIN_ROLES
from app.models.organization import Organization
from app.models.event import Event, EventStatus
from app.models.audit import AuditLog
from app.models.support import SupportTicket, AdminNote
from app.models.ledger import LedgerEntry
from app.models.order import Order, OrderItem
from app.models.ticket import Ticket, TicketType
from app.security import hash_password, verify_password

router = APIRouter(prefix="/admin", tags=["admin-system"])
public_support = APIRouter(prefix="/support", tags=["support"])

ADMIN_ONLY = (UserRole.ADMIN, UserRole.SUPERADMIN)
MODERATOR_ROLES = (UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.EVENT_MODERATOR)
REVIEWER_ROLES = (UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ORGANIZER_REVIEWER)
SUPPORT_ROLES = (UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.SUPPORT_ADMIN)
FINANCE_ROLES = (UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.FINANCE_ADMIN)
SECURITY_ROLES = (UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.SECURITY_ADMIN)
NOTE_ROLES = (UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.SUPPORT_ADMIN, UserRole.EVENT_MODERATOR, UserRole.ORGANIZER_REVIEWER)

def require_admin_role(*roles: UserRole):
    return require_role(*roles)

async def log_audit(db: AsyncSession, user_id: int, action: str, entity_type: str = None, entity_id: int = None, details: dict = None):
    entry = AuditLog(user_id=user_id, action=action, entity_type=entity_type, entity_id=entity_id, details=details)
    db.add(entry)
    await db.commit()

def paginate(page: int, page_size: int):
    page = max(1, page)
    page_size = min(max(1, page_size), 100)
    return page, page_size

@router.get("/dashboard")
async def dashboard(user: User = Depends(require_admin_role(*ADMIN_ONLY)), db: AsyncSession = Depends(get_db)):
    users_count = await db.scalar(select(func.count(User.id)))
    orgs_count = await db.scalar(select(func.count(Organization.id)))
    events_count = await db.scalar(select(func.count(Event.id)))
    published = await db.scalar(select(func.count(Event.id)).where(Event.status == EventStatus.PUBLISHED.value))
    pending_orgs = await db.scalar(select(func.count(Organization.id)).where(Organization.verification_status == "SUBMITTED"))
    open_tickets = await db.scalar(select(func.count(SupportTicket.id)).where(SupportTicket.status == "OPEN"))
    orders_count = await db.scalar(select(func.count(Order.id)))
    return {
        "users": users_count or 0,
        "organizations": orgs_count or 0,
        "events": events_count or 0,
        "published_events": published or 0,
        "pending_verifications": pending_orgs or 0,
        "open_support_tickets": open_tickets or 0,
        "orders": orders_count or 0,
        "note": "Real counts from database only. No estimated or fake financial data."
    }

@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: str = None,
    active: bool = None,
    q: str = None,
    date_from: str = None,
    date_to: str = None,
    sort: str = Query("created_at"),
    order: str = Query("desc"),
    user: User = Depends(require_admin_role(*ADMIN_ONLY)),
    db: AsyncSession = Depends(get_db)
):
    page, page_size = paginate(page, page_size)
    query = select(User)
    if role:
        query = query.where(User.role == role)
    if active is not None:
        query = query.where(User.is_active == active)
    if q:
        term = f"%{q.strip()}%"
        conditions = [User.email.ilike(term), User.full_name.ilike(term)]
        if q.strip().isdigit():
            conditions.append(User.id == int(q.strip()))
        query = query.where(or_(*conditions))
    if date_from:
        try:
            query = query.where(User.created_at >= datetime.fromisoformat(date_from))
        except ValueError:
            pass
    if date_to:
        try:
            query = query.where(User.created_at <= datetime.fromisoformat(date_to + "T23:59:59"))
        except ValueError:
            pass
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    sort_col = {"id": User.id, "email": User.email, "created_at": User.created_at, "role": User.role}.get(sort, User.created_at)
    query = query.order_by(sort_col.asc() if order == "asc" else sort_col.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    users = (await db.execute(query)).scalars().all()
    return {
        "total": total or 0,
        "page": page,
        "page_size": page_size,
        "items": [{
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "updated_at": u.updated_at.isoformat() if u.updated_at else None,
        } for u in users]
    }


@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: int,
    user: User = Depends(require_admin_role(*ADMIN_ONLY)),
    db: AsyncSession = Depends(get_db)
):
    target = await db.get(User, user_id)
    if not target:
        raise HTTPException(404, "User not found")
    orders = (await db.execute(select(Order).where(Order.user_id == user_id).order_by(Order.created_at.desc()).limit(20))).scalars().all()
    tickets = (await db.execute(
        select(Ticket, Order.id)
        .join(OrderItem, Ticket.order_item_id == OrderItem.id)
        .join(Order, OrderItem.order_id == Order.id)
        .where(Order.user_id == user_id)
        .order_by(Ticket.created_at.desc())
        .limit(20)
    )).all()
    last_order = orders[0].created_at if orders else None
    last_activity = max(filter(None, [target.updated_at, last_order]), default=None)
    return {
        "id": target.id,
        "email": target.email,
        "full_name": target.full_name,
        "phone": target.phone,
        "role": target.role,
        "is_active": target.is_active,
        "is_verified": target.is_verified,
        "created_at": target.created_at.isoformat() if target.created_at else None,
        "updated_at": target.updated_at.isoformat() if target.updated_at else None,
        "last_activity": last_activity.isoformat() if last_activity else None,
        "orders": [{
            "id": o.id,
            "reference": o.reference,
            "status": o.status,
            "total_amount": float(o.total_amount) if o.total_amount else 0,
            "created_at": o.created_at.isoformat() if o.created_at else None,
        } for o in orders],
        "tickets": [{
            "id": t.id,
            "code": t.code,
            "is_used": t.is_used,
            "order_id": oid,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        } for t, oid in tickets],
    }

@router.patch("/users/{user_id}/role")
async def change_user_role(user_id: int, new_role: str, user: User = Depends(require_admin_role(UserRole.SUPERADMIN)), db: AsyncSession = Depends(get_db)):
    if new_role not in [r.value for r in UserRole]:
        raise HTTPException(400, "Invalid role")
    if user_id == user.id and new_role not in ADMIN_ROLES:
        raise HTTPException(403, "Cannot demote self from admin roles")
    target = await db.get(User, user_id)
    if not target:
        raise HTTPException(404, "User not found")
    old_role = target.role
    target.role = new_role
    await db.commit()
    await log_audit(db, user.id, "user.role_changed", "user", user_id, {"from": old_role, "to": new_role})
    return {"id": target.id, "role": target.role}

@router.patch("/users/{user_id}/active")
async def set_user_active(user_id: int, active: bool, user: User = Depends(require_admin_role(*ADMIN_ONLY)), db: AsyncSession = Depends(get_db)):
    if user_id == user.id:
        raise HTTPException(403, "Cannot change own active status")
    target = await db.get(User, user_id)
    if not target:
        raise HTTPException(404, "User not found")
    target.is_active = active
    await db.commit()
    await log_audit(db, user.id, "user.active_changed", "user", user_id, {"active": active})
    return {"id": target.id, "is_active": target.is_active}

class PasswordChangeIn(BaseModel):
    current_password: Optional[str] = None
    new_password: str

@router.post("/users/me/password")
async def change_own_password(data: PasswordChangeIn, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not data.current_password or not verify_password(data.current_password, user.password_hash):
        raise HTTPException(400, "Current password incorrect")
    user.password_hash = hash_password(data.new_password)
    await db.commit()
    await log_audit(db, user.id, "user.password_changed", "user", user.id, {"self": True})
    return {"status": "ok"}

@router.post("/users/{user_id}/password")
async def admin_reset_password(user_id: int, data: PasswordChangeIn, user: User = Depends(require_admin_role(UserRole.SUPERADMIN)), db: AsyncSession = Depends(get_db)):
    target = await db.get(User, user_id)
    if not target:
        raise HTTPException(404, "User not found")
    target.password_hash = hash_password(data.new_password)
    await db.commit()
    await log_audit(db, user.id, "user.password_reset_by_admin", "user", user_id)
    return {"status": "ok", "user_id": user_id}

@router.get("/organizations/pending")
async def pending_organizations(user: User = Depends(require_admin_role(*REVIEWER_ROLES)), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Organization).where(Organization.verification_status == "SUBMITTED"))
    orgs = result.scalars().all()
    return [{"id": o.id, "name": o.name, "verification_status": o.verification_status, "submitted_at": o.verification_submitted_at.isoformat() if o.verification_submitted_at else None} for o in orgs]

@router.post("/organizations/{org_id}/approve")
async def approve_organization(org_id: int, user: User = Depends(require_admin_role(*REVIEWER_ROLES)), db: AsyncSession = Depends(get_db)):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(404, "Organization not found")
    org.verification_status = "VERIFIED"
    org.verified_at = datetime.utcnow()
    org.verified_by = user.id
    await db.commit()
    await log_audit(db, user.id, "org.approved", "organization", org_id)
    return {"id": org.id, "verification_status": org.verification_status}

@router.post("/organizations/{org_id}/reject")
async def reject_organization(org_id: int, reason: str, user: User = Depends(require_admin_role(*REVIEWER_ROLES)), db: AsyncSession = Depends(get_db)):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(404, "Organization not found")
    org.verification_status = "REJECTED"
    org.rejection_reason = reason
    await db.commit()
    await log_audit(db, user.id, "org.rejected", "organization", org_id, {"reason": reason})
    return {"id": org.id, "verification_status": org.verification_status}

@router.get("/events/moderation")
async def events_for_moderation(status: str = "SUBMITTED", user: User = Depends(require_admin_role(*MODERATOR_ROLES)), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.status == status))
    events = result.scalars().all()
    return [{"id": e.id, "title": e.title, "status": e.status, "slug": e.slug} for e in events]

@router.post("/events/{event_id}/status")
async def change_event_status(event_id: int, new_status: str, user: User = Depends(require_admin_role(*MODERATOR_ROLES)), db: AsyncSession = Depends(get_db)):
    if new_status not in [s.value for s in EventStatus]:
        raise HTTPException(400, "Invalid status")
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(404, "Event not found")
    old = event.status
    event.status = new_status
    await db.commit()
    await log_audit(db, user.id, "event.status_changed", "event", event_id, {"from": old, "to": new_status})
    return {"id": event.id, "status": event.status}

@router.get("/orders")
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    q: Optional[str] = None,
    status: Optional[str] = None,
    sort: str = Query("created_at"),
    order: str = Query("desc"),
    user: User = Depends(require_admin_role(*ADMIN_ONLY)),
    db: AsyncSession = Depends(get_db)
):
    from app.models.order import OrderStatus
    from sqlalchemy import or_
    page, page_size = paginate(page, page_size)
    query = select(Order)
    if status and status in {s.value for s in OrderStatus}:
        query = query.where(Order.status == status)
    if q:
        term = f"%{q.strip()}%"
        buyer_ids = [r[0] for r in (await db.execute(select(User.id).where(or_(User.email.ilike(term), User.full_name.ilike(term))))).all()]
        event_ids = [r[0] for r in (await db.execute(select(Event.id).where(Event.title.ilike(term)))).all()]
        type_ids = [r[0] for r in (await db.execute(select(TicketType.id).where(TicketType.event_id.in_(event_ids)))).all()] if event_ids else []
        order_ids_from_event = [r[0] for r in (await db.execute(select(OrderItem.order_id).where(OrderItem.ticket_type_id.in_(type_ids)))).all()] if type_ids else []
        conds = [Order.reference.ilike(term)]
        if buyer_ids:
            conds.append(Order.user_id.in_(buyer_ids))
        if order_ids_from_event:
            conds.append(Order.id.in_(order_ids_from_event))
        if q.strip().isdigit():
            conds.append(Order.id == int(q.strip()))
        query = query.where(or_(*conds))
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    col = {"id": Order.id, "created_at": Order.created_at, "total_amount": Order.total_amount}.get(sort, Order.created_at)
    query = query.order_by(col.asc() if order == "asc" else col.desc())
    orders = (await db.execute(query.offset((page - 1) * page_size).limit(page_size))).scalars().all()
    items = []
    for o in orders:
        buyer = await db.get(User, o.user_id)
        items.append({
            "id": o.id, "reference": o.reference, "status": o.status,
            "total_amount": float(o.total_amount) if o.total_amount else 0,
            "currency": o.currency, "user_id": o.user_id,
            "buyer_email": buyer.email if buyer else None,
            "buyer_name": buyer.full_name if buyer else None,
            "created_at": o.created_at.isoformat() if o.created_at else None,
        })
    return {"total": total or 0, "page": page, "page_size": page_size, "items": items, "statuses": [s.value for s in OrderStatus]}

# Platform settings removed from here. Use app.routers.admin_settings (PostgreSQL PlatformSettings).

# --- Support Tickets (admin) ---
@router.get("/support/tickets")
async def list_tickets(
    status: str = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(require_admin_role(*SUPPORT_ROLES)),
    db: AsyncSession = Depends(get_db)
):
    page, page_size = paginate(page, page_size)
    q = select(SupportTicket)
    if status:
        q = q.where(SupportTicket.status == status)
    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    q = q.order_by(SupportTicket.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    tickets = result.scalars().all()
    return {
        "total": total or 0,
        "page": page,
        "page_size": page_size,
        "items": [{"id": t.id, "subject": t.subject, "status": t.status, "user_id": t.user_id, "assigned_to": t.assigned_to, "created_at": t.created_at.isoformat() if t.created_at else None} for t in tickets]
    }

@router.post("/support/tickets/{ticket_id}/status")
async def update_ticket_status(ticket_id: int, status: str, user: User = Depends(require_admin_role(*SUPPORT_ROLES)), db: AsyncSession = Depends(get_db)):
    ticket = await db.get(SupportTicket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    ticket.status = status
    if status == "CLOSED":
        ticket.closed_at = datetime.utcnow()
    await db.commit()
    await log_audit(db, user.id, "ticket.status_changed", "support_ticket", ticket_id, {"status": status})
    return {"id": ticket.id, "status": ticket.status}

@router.post("/support/tickets/{ticket_id}/assign")
async def assign_ticket(ticket_id: int, assignee_id: int, user: User = Depends(require_admin_role(*SUPPORT_ROLES)), db: AsyncSession = Depends(get_db)):
    ticket = await db.get(SupportTicket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    assignee = await db.get(User, assignee_id)
    if not assignee or assignee.role not in ADMIN_ROLES:
        raise HTTPException(400, "Assignee must be an admin")
    ticket.assigned_to = assignee_id
    await db.commit()
    await log_audit(db, user.id, "ticket.assigned", "support_ticket", ticket_id, {"assignee_id": assignee_id})
    return {"id": ticket.id, "assigned_to": ticket.assigned_to}

# --- Admin Notes CRUD ---
@router.post("/notes")
async def create_note(
    entity_type: str,
    entity_id: int,
    note: str,
    user: User = Depends(require_admin_role(*NOTE_ROLES)),
    db: AsyncSession = Depends(get_db)
):
    if entity_type not in ("user", "organization", "event", "support_ticket"):
        raise HTTPException(400, "Invalid entity_type")
    n = AdminNote(admin_id=user.id, entity_type=entity_type, entity_id=entity_id, note=note)
    db.add(n)
    await db.commit()
    await db.refresh(n)
    await log_audit(db, user.id, "note.created", entity_type, entity_id, {"note_id": n.id})
    return {"id": n.id, "entity_type": n.entity_type, "entity_id": n.entity_id, "note": n.note, "created_at": n.created_at.isoformat()}

@router.get("/notes")
async def list_notes(
    entity_type: str = None,
    entity_id: int = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(require_admin_role(*NOTE_ROLES)),
    db: AsyncSession = Depends(get_db)
):
    page, page_size = paginate(page, page_size)
    q = select(AdminNote)
    if entity_type:
        q = q.where(AdminNote.entity_type == entity_type)
    if entity_id is not None:
        q = q.where(AdminNote.entity_id == entity_id)
    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    q = q.order_by(AdminNote.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    notes = result.scalars().all()
    return {
        "total": total or 0,
        "page": page,
        "page_size": page_size,
        "items": [{"id": n.id, "admin_id": n.admin_id, "entity_type": n.entity_type, "entity_id": n.entity_id, "note": n.note, "created_at": n.created_at.isoformat()} for n in notes]
    }

@router.patch("/notes/{note_id}")
async def update_note(note_id: int, note: str, user: User = Depends(require_admin_role(*NOTE_ROLES)), db: AsyncSession = Depends(get_db)):
    n = await db.get(AdminNote, note_id)
    if not n:
        raise HTTPException(404, "Note not found")
    if n.admin_id != user.id and user.role != UserRole.SUPERADMIN.value:
        raise HTTPException(403, "Only author or superadmin can edit")
    n.note = note
    await db.commit()
    await log_audit(db, user.id, "note.updated", n.entity_type, n.entity_id, {"note_id": note_id})
    return {"id": n.id, "note": n.note}

@router.delete("/notes/{note_id}")
async def delete_note(note_id: int, user: User = Depends(require_admin_role(*NOTE_ROLES)), db: AsyncSession = Depends(get_db)):
    n = await db.get(AdminNote, note_id)
    if not n:
        raise HTTPException(404, "Note not found")
    if n.admin_id != user.id and user.role != UserRole.SUPERADMIN.value:
        raise HTTPException(403, "Only author or superadmin can delete")
    await db.delete(n)
    await db.commit()
    await log_audit(db, user.id, "note.deleted", n.entity_type, n.entity_id, {"note_id": note_id})
    return {"deleted": True, "id": note_id}

# --- Audit with pagination ---
@router.get("/audit")
async def audit_log(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    user: User = Depends(require_admin_role(*SECURITY_ROLES)),
    db: AsyncSession = Depends(get_db)
):
    page, page_size = paginate(page, page_size)
    total = await db.scalar(select(func.count(AuditLog.id)))
    q = select(AuditLog).order_by(AuditLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    logs = result.scalars().all()
    return {
        "total": total or 0,
        "page": page,
        "page_size": page_size,
        "items": [{"id": l.id, "user_id": l.user_id, "action": l.action, "entity_type": l.entity_type, "entity_id": l.entity_id, "details": l.details, "created_at": l.created_at.isoformat() if l.created_at else None} for l in logs]
    }

@router.get("/finance/overview")
async def finance_overview(user: User = Depends(require_admin_role(*FINANCE_ROLES)), db: AsyncSession = Depends(get_db)):
    ledger_count = await db.scalar(select(func.count(LedgerEntry.id)))
    return {
        "ledger_entries": ledger_count or 0,
        "note": "Financial data is append-only. No payouts or live payments are active. Counts only."
    }

# --- Public Support (authenticated user) ---
@public_support.post("/tickets")
async def create_ticket(subject: str, body: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    t = SupportTicket(user_id=user.id, subject=subject, body=body, status="OPEN")
    db.add(t)
    await db.commit()
    await db.refresh(t)
    return {"id": t.id, "subject": t.subject, "status": t.status, "created_at": t.created_at.isoformat()}

@public_support.get("/tickets")
async def my_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    page, page_size = paginate(page, page_size)
    q = select(SupportTicket).where(SupportTicket.user_id == user.id)
    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    q = q.order_by(SupportTicket.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    tickets = result.scalars().all()
    return {
        "total": total or 0,
        "page": page,
        "page_size": page_size,
        "items": [{"id": t.id, "subject": t.subject, "status": t.status, "created_at": t.created_at.isoformat() if t.created_at else None} for t in tickets]
    }

@public_support.get("/tickets/{ticket_id}")
async def get_own_ticket(ticket_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Return own support ticket. 404 if not owner or not found (prevents enumeration)."""
    ticket = await db.get(SupportTicket, ticket_id)
    if not ticket or ticket.user_id != user.id:
        raise HTTPException(404, "Ticket not found")
    return {
        "id": ticket.id,
        "subject": ticket.subject,
        "body": ticket.body,
        "status": ticket.status,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
    }
