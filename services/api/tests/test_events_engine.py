import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.event import Event, EventStatus
from app.models.organization import Organization, OrganizationMember, OrgRole
from app.models.user import User
from app.security import hash_password

@pytest.mark.asyncio
async def test_event_lifecycle_and_visibility(client: AsyncClient, db_session: AsyncSession):
    user = User(email="orguser@example.com", password_hash=hash_password("pass123456"), full_name="Org User", role="ORGANIZER")
    db_session.add(user)
    await db_session.flush()
    org = Organization(name="Test Org", slug="test-org")
    db_session.add(org)
    await db_session.flush()
    db_session.add(OrganizationMember(user_id=user.id, organization_id=org.id, role=OrgRole.OWNER))
    await db_session.commit()

    login = await client.post("/auth/login", json={"email": "orguser@example.com", "password": "pass123456"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    create = await client.post("/organizer/events", headers=headers, json={
        "title": "Test Concert",
        "organization_id": org.id,
        "start_at": (datetime.utcnow() + timedelta(days=10)).isoformat(),
        "timezone": "Europe/Sarajevo"
    })
    assert create.status_code == 200
    eid = create.json()["id"]
    assert create.json()["status"] == "DRAFT"

    pub = await client.get(f"/events/{eid}")
    assert pub.status_code == 404

    sub = await client.post(f"/organizer/events/{eid}/submit", headers=headers)
    assert sub.status_code == 200
    assert sub.json()["status"] == "SUBMITTED"

@pytest.mark.asyncio
async def test_idor_protection(client: AsyncClient, db_session: AsyncSession):
    u1 = User(email="u1@example.com", password_hash=hash_password("pass123456"), full_name="U1", role="ORGANIZER")
    u2 = User(email="u2@example.com", password_hash=hash_password("pass123456"), full_name="U2", role="ORGANIZER")
    db_session.add_all([u1, u2])
    await db_session.flush()
    org = Organization(name="Org1", slug="org1")
    db_session.add(org)
    await db_session.flush()
    db_session.add(OrganizationMember(user_id=u1.id, organization_id=org.id, role=OrgRole.OWNER))
    e = Event(organization_id=org.id, title="Private", slug="private-evt", start_at=datetime.utcnow() + timedelta(days=1), status=EventStatus.DRAFT.value)
    db_session.add(e)
    await db_session.commit()

    login2 = await client.post("/auth/login", json={"email": "u2@example.com", "password": "pass123456"})
    headers2 = {"Authorization": f"Bearer {login2.json()['access_token']}"}

    get_other = await client.get(f"/organizer/events/{e.id}", headers=headers2)
    assert get_other.status_code == 403

@pytest.mark.asyncio
async def test_public_search_pagination(client: AsyncClient, db_session: AsyncSession):
    org = Organization(name="Search Org", slug="search-org")
    db_session.add(org)
    await db_session.flush()
    for i in range(3):
        db_session.add(Event(
            organization_id=org.id, title=f"Event {i}", slug=f"event-{i}",
            start_at=datetime.utcnow() + timedelta(days=i+1),
            status=EventStatus.PUBLISHED.value, is_published=True, city="Sarajevo"
        ))
    await db_session.commit()

    r = await client.get("/events?city=Sarajevo&limit=2")
    assert r.status_code == 200
    assert len(r.json()) <= 2

    s = await client.get("/events/search?q=Event")
    assert s.status_code == 200
    assert len(s.json()) >= 1
