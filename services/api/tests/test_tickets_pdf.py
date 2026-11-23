import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.organization import Organization, OrganizationMember, OrgRole
from app.models.event import Event, EventStatus
from app.models.order import Order, OrderItem, OrderStatus
from app.models.ticket import Ticket, TicketType
from app.models.inventory import TicketInventory
from app.security import hash_password
from datetime import datetime
import io


async def _seed(db: AsyncSession, email: str, event_id: int):
    user = User(email=email, password_hash=hash_password("pass"), role=UserRole.ORGANIZER.value, is_active=True, full_name="Test User")
    db.add(user)
    await db.flush()
    org = Organization(name=f"Org {event_id}", slug=f"org-{event_id}", verification_status="VERIFIED")
    db.add(org)
    await db.flush()
    db.add(OrganizationMember(user_id=user.id, organization_id=org.id, role=OrgRole.OWNER.value))
    event = Event(id=event_id, organization_id=org.id, title=f"Event {event_id}", slug=f"ev-{event_id}", start_at=datetime.utcnow(), status=EventStatus.PUBLISHED.value)
    db.add(event)
    await db.flush()
    tt = TicketType(event_id=event.id, name="GA", price=10, quantity_total=100, is_active=True)
    db.add(tt)
    await db.flush()
    db.add(TicketInventory(ticket_type_id=tt.id, available=100, reserved=0, sold=0, version=1))
    order = Order(user_id=user.id, status=OrderStatus.PAID.value, total_amount=10, currency="EUR", reference=f"BE-TEST-{event_id}")
    db.add(order)
    await db.flush()
    oi = OrderItem(order_id=order.id, ticket_type_id=tt.id, quantity=1, unit_price=10)
    db.add(oi)
    await db.flush()
    ticket = Ticket(ticket_type_id=tt.id, order_item_id=oi.id, code=f"T{event_id}", qr_data=f"BE:T{event_id}:{order.id}", is_used=False)
    db.add(ticket)
    await db.commit()
    return user, org, event, ticket


async def _token(client: AsyncClient, email: str):
    r = await client.post("/auth/login", json={"email": email, "password": "pass"})
    return r.json()["access_token"]


@pytest.mark.asyncio
async def test_ticket_pdf(client: AsyncClient, db_session: AsyncSession):
    user, org, event, ticket = await _seed(db_session, "pdf1@test.com", 3001)
    token = await _token(client, "pdf1@test.com")
    r = await client.get(f"/tickets/{ticket.id}/pdf", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/pdf"
    assert r.content[:4] == b"%PDF"


@pytest.mark.asyncio
async def test_guest_list_crud(client: AsyncClient, db_session: AsyncSession):
    user, org, event, ticket = await _seed(db_session, "gl1@test.com", 3002)
    token = await _token(client, "gl1@test.com")
    h = {"Authorization": f"Bearer {token}"}

    r = await client.post("/guest-lists", json={"event_id": 3002, "name": "VIP"}, headers=h)
    assert r.status_code == 200
    lid = r.json()["id"]

    r = await client.post(f"/guest-lists/{lid}/guests", json={"first_name": "Ana", "last_name": "Horvat", "email": "ana@test.com"}, headers=h)
    assert r.status_code == 200

    r = await client.get(f"/guest-lists/{lid}/guests?q=Ana", headers=h)
    assert r.status_code == 200
    assert len(r.json()) == 1

    r = await client.get(f"/guest-lists/{lid}/export.csv", headers=h)
    assert r.status_code == 200
    assert b"Ana" in r.content

    r = await client.get(f"/guest-lists/{lid}/export.pdf", headers=h)
    assert r.status_code == 200
    assert r.content[:4] == b"%PDF"


@pytest.mark.asyncio
async def test_guest_list_isolation(client: AsyncClient, db_session: AsyncSession):
    u1, o1, e1, t1 = await _seed(db_session, "gl2a@test.com", 3003)
    u2 = User(email="gl2b@test.com", password_hash=hash_password("pass"), role=UserRole.ORGANIZER.value, is_active=True)
    db_session.add(u2)
    await db_session.commit()
    t1 = await _token(client, "gl2a@test.com")
    t2 = await _token(client, "gl2b@test.com")

    r = await client.post("/guest-lists", json={"event_id": 3003, "name": "Private"}, headers={"Authorization": f"Bearer {t1}"})
    lid = r.json()["id"]

    r = await client.get(f"/guest-lists/{lid}/guests", headers={"Authorization": f"Bearer {t2}"})
    assert r.status_code == 403
