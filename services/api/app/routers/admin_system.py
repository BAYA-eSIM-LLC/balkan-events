from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from datetime import datetime
from app.database import get_db
from app.deps import get_current_user, require_role
from app.models.user import User, UserRole, ADMIN_ROLES
from app.models.organization import Organization
from app.models.event import Event, EventStatus
from app.models.audit import AuditLog
from app.models.support import SupportTicket, AdminNote
from app.models.ledger import LedgerEntry

router = APIRouter(prefix="/admin", tags=["admin-system"])

ADMIN_ONLY = (UserRole.ADMIN, UserRole.SUPERADMIN)
MODERATOR_ROLES = (UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.EVENT_MODERATOR)
REVIEWER_ROLES = (UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ORGANIZER_REVIEWER)
SUPPORT_ROLES = (UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.SUPPORT_ADMIN)
FINANCE_ROLES = (UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.FINANCE_ADMIN)
SECURITY_ROLES = (UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.SECURITY_ADMIN)

def require_admin_role(*roles: UserRole):
    return require_role(*roles)

async def log_audit(db: AsyncSession, user_id: int, action: str, entity_type: str = None, entity_id: int = None, details: dict = None):
    entry = AuditLog(user_id=user_id, action=action, entity_type=entity_type, entity_id=entity_id, details=details)
    db.add(entry)
    await db.commit()

@router.get("/dashboard")
async def dashboard(user: User = Depends(require_admin_role(*ADMIN_ONLY)), db: AsyncSession = Depends(get_db)):
    users_count = await db.scalar(select(func.count(User.id)))
    orgs_count = await db.scalar(select(func.count(Organization.id)))
    events_count = await db.scalar(select(func.count(Event.id)))
    published = await db.scalar(select(func.count(Event.id)).where(Event.status == EventStatus.PUBLISHED.value))
    pending_orgs = await db.scalar(select(func.count(Organization.id)).where(Organization.verification_status == "SUBMITTED"))
    open_tickets = await db.scalar(select(func.count(SupportTicket.id)).where(SupportTicket.status == "OPEN"))
    return {
        "users": users_count or 0,
        "organizations": orgs_count or 0,
        "events": events_count or 0,
        "published_events": published or 0,
        "pending_verifications": pending_orgs or 0,
        "open_support_tickets": open_tickets or 0,
        "note": "Real counts from database only. No estimated or fake financial data."
    }

@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    role: str = None,
    active: bool = None,
    user: User = Depends(require_admin_role(*ADMIN_ONLY)),
    db: AsyncSession = Depends(get_db)
):
    q = select(User)
    if role:
        q = q.where(User.role == role)
    if active is not None:
        q = q.where(User.is_active == active)
    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    q = q.offset((page - 1) * limit).limit(limit)
    result = await db.execute(q)
    users = result.scalars().all()
    return {
        "total": total or 0,
        "page": page,
        "items": [{"id": u.id, "email": u.email, "role": u.role, "is_active": u.is_active, "created_at": u.created_at.isoformat() if u.created_at else None} for u in users]
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

@router.get("/support/tickets")
async def list_tickets(status: str = None, user: User = Depends(require_admin_role(*SUPPORT_ROLES)), db: AsyncSession = Depends(get_db)):
    q = select(SupportTicket)
    if status:
        q = q.where(SupportTicket.status == status)
    result = await db.execute(q.order_by(SupportTicket.created_at.desc()))
    tickets = result.scalars().all()
    return [{"id": t.id, "subject": t.subject, "status": t.status, "user_id": t.user_id, "created_at": t.created_at.isoformat() if t.created_at else None} for t in tickets]

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

@router.get("/audit")
async def audit_log(page: int = 1, limit: int = 50, user: User = Depends(require_admin_role(*SECURITY_ROLES)), db: AsyncSession = Depends(get_db)):
    q = select(AuditLog).order_by(AuditLog.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(q)
    logs = result.scalars().all()
    return [{"id": l.id, "user_id": l.user_id, "action": l.action, "entity_type": l.entity_type, "entity_id": l.entity_id, "details": l.details, "created_at": l.created_at.isoformat() if l.created_at else None} for l in logs]

@router.get("/finance/overview")
async def finance_overview(user: User = Depends(require_admin_role(*FINANCE_ROLES)), db: AsyncSession = Depends(get_db)):
    ledger_count = await db.scalar(select(func.count(LedgerEntry.id)))
    return {
        "ledger_entries": ledger_count or 0,
        "note": "Financial data is append-only. No payouts or live payments are active. Counts only."
    }
