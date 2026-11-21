import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.event import Event, EventStatus
from app.models.organization import Organization
from app.models.performer import Performer, EventPerformer
from app.models.venue import Venue
from app.models.user import User
from app.models.user_extended import UserFavorite
from app.security import hash_password

@pytest.mark.asyncio
async def test_search_by_title_and_diacritics(client: AsyncClient, db_session: AsyncSession):
    org = Organization(name="Search Org", slug="search-org-d")
    db_session.add(org)
    await db_session.flush()
    e = Event(organization_id=org.id, title="Koncert Čćšžđ", slug="koncert-ccszd", start_at=datetime.utcnow() + timedelta(days=5), status=EventStatus.PUBLISHED.value, is_published=True, city="Sarajevo")
    db_session.add(e)
    await db_session.commit()

    r = await client.get("/events/search?q=koncert")
    assert r.status_code == 200
    assert r.json()["count"] >= 1

    r2 = await client.get("/events/search?q=ccs")
    assert r2.status_code == 200

@pytest.mark.asyncio
async def test_search_filters_combined(client: AsyncClient, db_session: AsyncSession):
    org = Organization(name="Filter Org", slug="filter-org")
    db_session.add(org)
    await db_session.flush()
    e = Event(organization_id=org.id, title="Weekend Show", slug="weekend-show", start_at=datetime.utcnow() + timedelta(days=2), status=EventStatus.PUBLISHED.value, is_published=True, city="Zagreb")
    db_session.add(e)
    await db_session.commit()

    r = await client.get("/events/search?city=Zagreb&date_preset=next7")
    assert r.status_code == 200
    assert any(x["slug"] == "weekend-show" for x in r.json()["results"])

@pytest.mark.asyncio
async def test_popular_only_published(client: AsyncClient, db_session: AsyncSession):
    org = Organization(name="Pop Org", slug="pop-org")
    db_session.add(org)
    await db_session.flush()
    e1 = Event(organization_id=org.id, title="Popular", slug="popular-1", start_at=datetime.utcnow() + timedelta(days=3), status=EventStatus.PUBLISHED.value, is_published=True, is_featured=True)
    e2 = Event(organization_id=org.id, title="Draft", slug="draft-1", start_at=datetime.utcnow() + timedelta(days=3), status=EventStatus.DRAFT.value)
    db_session.add_all([e1, e2])
    await db_session.commit()

    r = await client.get("/events/popular")
    assert r.status_code == 200
    slugs = [x["slug"] for x in r.json()["results"]]
    assert "popular-1" in slugs
    assert "draft-1" not in slugs

@pytest.mark.asyncio
async def test_admin_venue_crud(client: AsyncClient, db_session: AsyncSession):
    admin = User(email="adminv@example.com", password_hash=hash_password("pass123456"), full_name="Admin", role="ADMIN")
    db_session.add(admin)
    await db_session.commit()

    login = await client.post("/auth/login", json={"email": "adminv@example.com", "password": "pass123456"})
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    create = await client.post("/admin/venues", headers=headers, json={"name": "Test Venue", "city_id": None, "capacity": 500})
    assert create.status_code == 200
    vid = create.json()["id"]

    lst = await client.get("/admin/venues", headers=headers)
    assert lst.status_code == 200
    assert any(v["id"] == vid for v in lst.json())

    deact = await client.delete(f"/admin/venues/{vid}", headers=headers)
    assert deact.status_code == 200

@pytest.mark.asyncio
async def test_admin_performer_crud(client: AsyncClient, db_session: AsyncSession):
    admin = User(email="adminp@example.com", password_hash=hash_password("pass123456"), full_name="AdminP", role="ADMIN")
    db_session.add(admin)
    await db_session.commit()

    login = await client.post("/auth/login", json={"email": "adminp@example.com", "password": "pass123456"})
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    create = await client.post("/admin/performers", headers=headers, json={"name": "Test Band", "performer_type": "band"})
    assert create.status_code == 200
    pid = create.json()["id"]

    pub = await client.get(f"/performers/{pid}")
    assert pub.status_code == 200
    assert pub.json()["name"] == "Test Band"

    deact = await client.delete(f"/admin/performers/{pid}", headers=headers)
    assert deact.status_code == 200

    pub2 = await client.get(f"/performers/{pid}")
    assert pub2.status_code == 404

@pytest.mark.asyncio
async def test_non_admin_cannot_create_venue(client: AsyncClient, db_session: AsyncSession):
    user = User(email="userx@example.com", password_hash=hash_password("pass123456"), full_name="User", role="USER")
    db_session.add(user)
    await db_session.commit()

    login = await client.post("/auth/login", json={"email": "userx@example.com", "password": "pass123456"})
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    r = await client.post("/admin/venues", headers=headers, json={"name": "Nope"})
    assert r.status_code == 403
