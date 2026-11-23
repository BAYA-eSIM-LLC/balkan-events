"""Phase 19.3 POS ticket-type and analytics event-level tests."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.organization import Organization, OrganizationMember, OrgRole
from app.models.event import Event, EventStatus
from app.models.ticket import TicketType
from app.models.inventory import TicketInventory
from app.models.permissions import EventPermission
from app.models.pos import SalesPoint, SalesPointStaff, CashRegister
from app.security import hash_password
from datetime import datetime


async def _base(db: AsyncSession, email: str, role: str, event_id: int, can_pos=None):
    u = User(email=email, password_hash=hash_password("pass"), role=UserRole.ORGANIZER.value, is_active=True)
    db.add(u)
    await db.flush()
    org = Organization(name=f"E193 {email}", slug=f"e193-{email.split('@')[0]}", verification_status="VERIFIED")
    db.add(org)
    await db.flush()
    db.add(OrganizationMember(user_id=u.id, organization_id=org.id, role=role))
    event = Event(id=event_id, organization_id=org.id, title=f"E{event_id}", slug=f"e193-{event_id}", start_at=datetime.utcnow(), status=EventStatus.PUBLISHED.value)
    db.add(event)
    await db.flush()
    tt = TicketType(event_id=event.id, name="GA", price=10, quantity_total=50, is_active=True)
    db.add(tt)
    await db.flush()
    db.add(TicketInventory(ticket_type_id=tt.id, available=50, reserved=0, sold=0, version=1))
    if can_pos is not None:
        db.add(EventPermission(
            event_id=event.id, user_id=u.id, organization_id=org.id,
            can_pos=can_pos, can_manage=False, can_view_sales=False,
            can_view_finance=False, can_manage_tickets=False, can_scan=False,
        ))
    sp = SalesPoint(organization_id=org.id, name="Box")
    db.add(sp)
    await db.flush()
    db.add(SalesPointStaff(sales_point_id=sp.id, user_id=u.id, role="SELLER"))
    reg = CashRegister(sales_point_id=sp.id, opened_by=u.id, opening_balance=0, status="OPEN")
    db.add(reg)
    await db.commit()
    return u, org, event, tt, sp, reg


async def _token(client: AsyncClient, email: str):
    r = await client.post("/auth/login", json={"email": email, "password": "pass"})
    return r.json()["access_token"]


@pytest.mark.asyncio
async def test_pos_ticket_type_without_can_pos(client: AsyncClient, db_session: AsyncSession):
    u, org, event, tt, sp, reg = await _base(db_session, "p193a@test.com", OrgRole.POS_SELLER.value, 6001, can_pos=False)
    token = await _token(client, "p193a@test.com")
    r = await client.post("/pos/sale", json={
        "sales_point_id": sp.id, "register_id": reg.id, "ticket_type_id": tt.id, "quantity": 1,
    }, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_pos_ticket_type_with_can_pos(client: AsyncClient, db_session: AsyncSession):
    u, org, event, tt, sp, reg = await _base(db_session, "p193b@test.com", OrgRole.POS_SELLER.value, 6002, can_pos=True)
    token = await _token(client, "p193b@test.com")
    r = await client.post("/pos/sale", json={
        "sales_point_id": sp.id, "register_id": reg.id, "ticket_type_id": tt.id, "quantity": 1,
    }, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_pos_ticket_type_other_event_denied(client: AsyncClient, db_session: AsyncSession):
    # Seller allowed on event 6003, tries ticket type from event 6004
    u, org, e1, tt1, sp, reg = await _base(db_session, "p193c@test.com", OrgRole.POS_SELLER.value, 6003, can_pos=True)
    e2 = Event(id=6004, organization_id=org.id, title="Other", slug="e193-6004", start_at=datetime.utcnow(), status=EventStatus.PUBLISHED.value)
    db_session.add(e2)
    await db_session.flush()
    tt2 = TicketType(event_id=e2.id, name="Other", price=5, quantity_total=10, is_active=True)
    db_session.add(tt2)
    await db_session.flush()
    db_session.add(TicketInventory(ticket_type_id=tt2.id, available=10, reserved=0, sold=0, version=1))
    db_session.add(EventPermission(
        event_id=e2.id, user_id=u.id, organization_id=org.id,
        can_pos=False, can_manage=False, can_view_sales=False,
        can_view_finance=False, can_manage_tickets=False, can_scan=False,
    ))
    await db_session.commit()
    token = await _token(client, "p193c@test.com")
    r = await client.post("/pos/sale", json={
        "sales_point_id": sp.id, "register_id": reg.id, "ticket_type_id": tt2.id, "quantity": 1,
    }, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403
