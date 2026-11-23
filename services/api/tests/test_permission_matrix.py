"""Permission matrix tests.
Each role is checked against finance, scan, and guest-list (ticket manage) access.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.organization import Organization, OrganizationMember, OrgRole
from app.models.event import Event, EventStatus
from app.models.permissions import EventPermission
from app.security import hash_password
from datetime import datetime


ROLES_FINANCE = {
    OrgRole.OWNER.value: 200,
    OrgRole.ADMIN.value: 200,
    OrgRole.FINANCE_MANAGER.value: 200,
    OrgRole.FINANCE_VIEWER.value: 200,
    OrgRole.EVENT_MANAGER.value: 403,
    OrgRole.TICKET_MANAGER.value: 403,
    OrgRole.SCANNER.value: 403,
    OrgRole.POS_SELLER.value: 403,
    OrgRole.VIEWER.value: 403,
}


async def _make(db: AsyncSession, email: str, role: str, event_id: int):
    u = User(email=email, password_hash=hash_password("pass"), role=UserRole.ORGANIZER.value, is_active=True)
    db.add(u)
    await db.flush()
    org = Organization(name=f"M {email}", slug=f"m-{email.split('@')[0]}", verification_status="VERIFIED")
    db.add(org)
    await db.flush()
    db.add(OrganizationMember(user_id=u.id, organization_id=org.id, role=role))
    event = Event(id=event_id, organization_id=org.id, title=f"E {event_id}", slug=f"e-{event_id}", start_at=datetime.utcnow(), status=EventStatus.PUBLISHED.value)
    db.add(event)
    await db.commit()
    return u, org, event


async def _token(client: AsyncClient, email: str):
    r = await client.post("/auth/login", json={"email": email, "password": "pass"})
    return r.json()["access_token"]


@pytest.mark.asyncio
@pytest.mark.parametrize("role,expected", list(ROLES_FINANCE.items()))
async def test_finance_matrix(client: AsyncClient, db_session: AsyncSession, role, expected):
    email = f"mx-{role}-{expected}@test.com"
    u, org, event = await _make(db_session, email, role, 4000 + hash(role) % 1000)
    token = await _token(client, email)
    r = await client.get(f"/orgs/{org.id}/finance", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == expected, f"{role} got {r.status_code}"


@pytest.mark.asyncio
async def test_event_level_scan_deny(client: AsyncClient, db_session: AsyncSession):
    u, org, event = await _make(db_session, "scan-deny@test.com", OrgRole.SCANNER.value, 4100)
    # Explicit event deny
    db_session.add(EventPermission(
        event_id=event.id, user_id=u.id, organization_id=org.id,
        can_scan=False, can_manage=False, can_view_sales=False,
        can_view_finance=False, can_manage_tickets=False, can_pos=False,
    ))
    await db_session.commit()
    token = await _token(client, "scan-deny@test.com")
    r = await client.post("/scanner/validate", json={"qr_data": "x", "event_id": event.id}, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_resend_invitation(client: AsyncClient, db_session: AsyncSession):
    u, org, event = await _make(db_session, "resend@test.com", OrgRole.OWNER.value, 4200)
    token = await _token(client, "resend@test.com")
    h = {"Authorization": f"Bearer {token}"}
    r = await client.post(f"/orgs/{org.id}/invite", json={"email": "new@test.com", "role": "viewer"}, headers=h)
    assert r.status_code == 200
    inv_id = r.json()["id"]
    r = await client.post(f"/orgs/invitations/{inv_id}/resend", headers=h)
    assert r.status_code == 200
    assert "token" in r.json()
    assert r.json()["id"] != inv_id
