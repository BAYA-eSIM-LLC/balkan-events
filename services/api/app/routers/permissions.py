from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
import secrets, hashlib
from app.database import get_db
from app.models.organization import Organization, OrganizationMember, OrgRole
from app.models.permissions import EventPermission, OrgInvitation
from app.models.user import User, UserRole
from app.models.event import Event
from app.deps import get_current_user, require_role, get_org_member
from app.routers.admin_system import log_audit
from app.services.permissions import has_cap, ROLE_CAPS
from app.services.email import queue_email

router = APIRouter(prefix="/orgs", tags=["org-permissions"])
admin_router = APIRouter(prefix="/admin/organizations", tags=["admin-orgs"])

ADMIN_ROLES = (UserRole.ADMIN, UserRole.SUPERADMIN)
VALID_ROLES = {r.value for r in OrgRole}


class InviteIn(BaseModel):
    email: EmailStr
    role: str


class RoleUpdate(BaseModel):
    role: str


class EventPermIn(BaseModel):
    user_id: int
    can_manage: bool = False
    can_view_sales: bool = False
    can_view_finance: bool = False
    can_manage_tickets: bool = False
    can_scan: bool = False
    can_pos: bool = False


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


async def _require_cap(db: AsyncSession, org_id: int, user: User, cap: str):
    if user.role in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        return
    member = await get_org_member(org_id, user, db)
    if not member or not has_cap(member.role, cap):
        raise HTTPException(403, f"Missing capability: {cap}")


@admin_router.get("")
async def admin_list_orgs(user: User = Depends(require_role(*ADMIN_ROLES)), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Organization).order_by(Organization.created_at.desc()).limit(200))
    orgs = result.scalars().all()
    return [{"id": o.id, "name": o.name, "slug": o.slug, "is_active": o.is_active, "verification_status": o.verification_status} for o in orgs]


@admin_router.get("/{org_id}")
async def admin_org_detail(org_id: int, user: User = Depends(require_role(*ADMIN_ROLES)), db: AsyncSession = Depends(get_db)):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(404)
    members = (await db.execute(select(OrganizationMember).where(OrganizationMember.organization_id == org_id))).scalars().all()
    events = (await db.execute(select(Event).where(Event.organization_id == org_id))).scalars().all()
    return {
        "id": org.id, "name": org.name, "is_active": org.is_active,
        "members": [{"user_id": m.user_id, "role": m.role} for m in members],
        "events": [{"id": e.id, "title": e.title, "status": e.status} for e in events],
    }


@admin_router.post("/{org_id}/suspend")
async def suspend_org(org_id: int, user: User = Depends(require_role(*ADMIN_ROLES)), db: AsyncSession = Depends(get_db)):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(404)
    org.is_active = False
    await db.commit()
    await log_audit(db, user.id, "org.suspended", "Organization", org.id)
    return {"id": org.id, "is_active": False}


@router.get("/{org_id}/members")
async def list_members(org_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await _require_cap(db, org_id, user, "manage_team")
    members = (await db.execute(select(OrganizationMember).where(OrganizationMember.organization_id == org_id))).scalars().all()
    return [{"id": m.id, "user_id": m.user_id, "role": m.role} for m in members]


@router.post("/{org_id}/invite")
async def invite_member(org_id: int, data: InviteIn, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await _require_cap(db, org_id, user, "manage_team")
    if data.role not in VALID_ROLES:
        raise HTTPException(400, "Invalid role")
    token = secrets.token_urlsafe(32)
    inv = OrgInvitation(
        organization_id=org_id,
        email=data.email,
        role=data.role,
        token_hash=_hash(token),
        invited_by=user.id,
        expires_at=datetime.utcnow() + timedelta(days=7),
    )
    db.add(inv)
    await db.flush()
    await queue_email(
        db, data.email, "Invitation to Balkan Events",
        f"You have been invited. Token (do not share): {token}",
        "org_invite", "invitation", inv.id, f"invite:{inv.id}",
    )
    await db.commit()
    await log_audit(db, user.id, "org.invite.sent", "Organization", org_id, {"email": data.email, "role": data.role})
    return {"id": inv.id, "expires_at": inv.expires_at.isoformat(), "token": token}


@router.post("/invite/accept")
async def accept_invite(token: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    inv = (await db.execute(select(OrgInvitation).where(OrgInvitation.token_hash == _hash(token)))).scalar_one_or_none()
    if not inv or inv.revoked_at or inv.accepted_at:
        raise HTTPException(400, "Invalid invitation")
    if inv.expires_at < datetime.utcnow():
        raise HTTPException(400, "Invitation expired")
    if inv.email.lower() != user.email.lower():
        raise HTTPException(403, "Invitation email mismatch")
    existing = (await db.execute(select(OrganizationMember).where(
        OrganizationMember.organization_id == inv.organization_id,
        OrganizationMember.user_id == user.id,
    ))).scalar_one_or_none()
    if not existing:
        db.add(OrganizationMember(user_id=user.id, organization_id=inv.organization_id, role=inv.role))
    inv.accepted_at = datetime.utcnow()
    await db.commit()
    await log_audit(db, user.id, "org.invite.accepted", "Organization", inv.organization_id)
    return {"status": "accepted", "organization_id": inv.organization_id}


@router.post("/invitations/{invitation_id}/revoke")
async def revoke_invite(invitation_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    inv = await db.get(OrgInvitation, invitation_id)
    if not inv:
        raise HTTPException(404)
    await _require_cap(db, inv.organization_id, user, "manage_team")
    if inv.accepted_at:
        raise HTTPException(400, "Already accepted")
    inv.revoked_at = datetime.utcnow()
    await db.commit()
    await log_audit(db, user.id, "org.invite.revoked", "Organization", inv.organization_id)
    return {"status": "revoked"}


@router.patch("/{org_id}/members/{member_id}")
async def change_role(org_id: int, member_id: int, data: RoleUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await _require_cap(db, org_id, user, "manage_team")
    if data.role not in VALID_ROLES:
        raise HTTPException(400, "Invalid role")
    m = await db.get(OrganizationMember, member_id)
    if not m or m.organization_id != org_id:
        raise HTTPException(404)
    m.role = data.role
    await db.commit()
    await log_audit(db, user.id, "org.role.changed", "OrganizationMember", m.id, {"role": data.role})
    return {"id": m.id, "role": m.role}


@router.delete("/{org_id}/members/{member_id}")
async def remove_member(org_id: int, member_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await _require_cap(db, org_id, user, "manage_team")
    m = await db.get(OrganizationMember, member_id)
    if not m or m.organization_id != org_id:
        raise HTTPException(404)
    await db.delete(m)
    await db.commit()
    await log_audit(db, user.id, "org.member.removed", "OrganizationMember", member_id)
    return {"status": "removed"}


@router.post("/{org_id}/events/{event_id}/permissions")
async def set_event_permission(org_id: int, event_id: int, data: EventPermIn, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await _require_cap(db, org_id, user, "manage_team")
    event = await db.get(Event, event_id)
    if not event or event.organization_id != org_id:
        raise HTTPException(404)
    existing = (await db.execute(select(EventPermission).where(
        EventPermission.event_id == event_id, EventPermission.user_id == data.user_id
    ))).scalar_one_or_none()
    if existing:
        for k, v in data.model_dump().items():
            if k != "user_id":
                setattr(existing, k, v)
        ep = existing
    else:
        ep = EventPermission(event_id=event_id, organization_id=org_id, **data.model_dump())
        db.add(ep)
    await db.commit()
    await log_audit(db, user.id, "event.permission.set", "Event", event_id, {"user_id": data.user_id})
    return {"status": "ok"}


@router.get("/{org_id}/finance")
async def org_finance(org_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await _require_cap(db, org_id, user, "view_finance")
    return {"organization_id": org_id, "note": "Finance data available only to authorized roles", "gross": 0}


@router.get("/permissions/matrix")
async def permission_matrix():
    return ROLE_CAPS
