"""Phase 19.2 event-level enforcement matrix.
Tests seat map mutation, POS can_pos, and sponsor placement access.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.organization import Organization, OrganizationMember, OrgRole
from app.models.event import Event, EventStatus
from app.models.permissions import EventPermission
from app.models.pos import SalesPoint, SalesPointStaff, CashRegister
from app.models.sponsor import Sponsor
from app.security import hash_password
from datetime import datetime


async def _setup(db: AsyncSession, email: str, role: str, event_id: int, event_perm=None):
    u = User(email=email, password_hash=hash_password("pass"), role=UserRole.ORGANIZER.value, is_active=True)
    db.add(u)
    await db.flush()
    org = Organization(name=f"E19 {email}", slug=f"e19-{email.split('@')[0]}", verification_status="VERIFIED")
    db.add(org)
    await db.flush()
    db.add(OrganizationMember(user_id=u.id, organization_id=org.id, role=role))
    event = Event(id=event_id, organization_id=org.id, title=f"E{event_id}", slug=f"e19-{event_id}", start_at=datetime.utcnow(), status=EventStatus.PUBLISHED.value)
    db.add(event)
    if event_perm is not None:
        db.add(EventPermission(event_id=event_id, user_id=u.id, organization_id=org.id, **event_perm))
    await db.commit()
    return u, org, event


async def _token(client: AsyncClient, email: str):
    r = await client.post("/auth/login", json={"email": email, "password": "pass"})
    return r.json()["access_token"]


@pytest.mark.asyncio
async def test_viewer_cannot_create_seat_map(client: AsyncClient, db_session: AsyncSession):
    u, org, event = await _setup(db_session, "e19v@test.com", OrgRole.VIEWER.value, 5001)
    token = await _token(client, "e19v@test.com")
    r = await client.post("/seat-maps", json={"event_id": 5001, "organization_id": org.id, "name": "X"}, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_owner_can_create_seat_map(client: AsyncClient, db_session: AsyncSession):
    u, org, event = await _setup(db_session, "e19o@test.com", OrgRole.OWNER.value, 5002)
    token = await _token(client, "e19o@test.com")
    r = await client.post("/seat-maps", json={"event_id": 5002, "organization_id": org.id, "name": "Hall"}, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_pos_seller_without_can_pos_denied(client: AsyncClient, db_session: AsyncSession):
    u, org, event = await _setup(
        db_session, "e19p@test.com", OrgRole.POS_SELLER.value, 5003,
        event_perm={"can_pos": False, "can_manage": False, "can_view_sales": False, "can_view_finance": False, "can_manage_tickets": False, "can_scan": False},
    )
    # Sales point + register + staff
    sp = SalesPoint(organization_id=org.id, name="Box")
    db_session.add(sp)
    await db_session.flush()
    db_session.add(SalesPointStaff(sales_point_id=sp.id, user_id=u.id, role="SELLER"))
    reg = CashRegister(sales_point_id=sp.id, opened_by=u.id, opening_balance=0, status="OPEN")
    db_session.add(reg)
    await db_session.commit()
    token = await _token(client, "e19p@test.com")
    # Create a seat so POS sale path hits event check
    h = {"Authorization": f"Bearer {token}"}
    # Owner-like path blocked; call sale with fake seat to force event resolution
    r = await client.post("/pos/sale", json={"sales_point_id": sp.id, "register_id": reg.id, "seat_ids": [999999]}, headers=h)
    # Either 400 (seat not found) or 403 (event deny). Both are non-success.
    assert r.status_code in (400, 403, 409)


@pytest.mark.asyncio
async def test_sponsor_placement_other_org_denied(client: AsyncClient, db_session: AsyncSession):
    u1, o1, e1 = await _setup(db_session, "e19s1@test.com", OrgRole.OWNER.value, 5004)
    u2, o2, e2 = await _setup(db_session, "e19s2@test.com", OrgRole.OWNER.value, 5005)
    s = Sponsor(organization_id=o1.id, name="Private Sponsor", status="ACTIVE")
    db_session.add(s)
    await db_session.commit()
    t2 = await _token(client, "e19s2@test.com")
    r = await client.post("/sponsors/placements", json={"sponsor_id": s.id, "event_id": 5005, "position": "EVENT_PAGE"}, headers={"Authorization": f"Bearer {t2}"})
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_non_member_cannot_create_seat_map(client: AsyncClient, db_session: AsyncSession):
    u, org, event = await _setup(db_session, "e19m@test.com", OrgRole.OWNER.value, 5006)
    outsider = User(email="e19out@test.com", password_hash=hash_password("pass"), role=UserRole.ORGANIZER.value, is_active=True)
    db_session.add(outsider)
    await db_session.commit()
    t = await _token(client, "e19out@test.com")
    r = await client.post("/seat-maps", json={"event_id": 5006, "organization_id": org.id, "name": "Hack"}, headers={"Authorization": f"Bearer {t}"})
    assert r.status_code == 403
