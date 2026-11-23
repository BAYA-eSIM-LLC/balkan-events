"""Venue and performer catalog is platform-owned. Only ADMIN and SUPERADMIN may mutate it."""
import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import update
from app.models.user import User

pytestmark = pytest.mark.asyncio

def _email():
    return f"rbac-{uuid.uuid4().hex[:8]}@example.com"

async def _user(client, db_session, role="user"):
    email = _email()
    r = await client.post("/auth/register", json={
        "email": email, "password": "securepass123", "full_name": "RBAC",
    })
    assert r.status_code == 200, r.text
    if role != "user":
        await db_session.execute(update(User).where(User.email == email).values(role=role))
        await db_session.commit()
        login = await client.post("/auth/login", json={"email": email, "password": "securepass123"})
        token = login.json()["access_token"]
    else:
        token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

async def test_user_cannot_mutate_catalog(client: AsyncClient, db_session):
    h = await _user(client, db_session, "user")
    assert (await client.post("/admin/venues", json={"name": "X"}, headers=h)).status_code == 403
    assert (await client.patch("/admin/venues/1", json={"name": "Y"}, headers=h)).status_code == 403
    assert (await client.delete("/admin/venues/1", headers=h)).status_code == 403
    assert (await client.post("/admin/performers", json={"name": "P", "performer_type": "artist"}, headers=h)).status_code == 403
    assert (await client.get("/admin/me", headers=h)).status_code == 403

async def test_organizer_cannot_mutate_catalog(client: AsyncClient, db_session):
    h = await _user(client, db_session, "organizer")
    assert (await client.post("/admin/venues", json={"name": "X"}, headers=h)).status_code == 403
    assert (await client.post("/admin/performers", json={"name": "P", "performer_type": "artist"}, headers=h)).status_code == 403
    assert (await client.get("/admin/dashboard", headers=h)).status_code == 403

async def test_admin_can_create_venue(client: AsyncClient, db_session):
    h = await _user(client, db_session, "admin")
    r = await client.post("/admin/venues", json={"name": f"Hall {uuid.uuid4().hex[:6]}"}, headers=h)
    assert r.status_code == 200, r.text
    assert (await client.get("/admin/me", headers=h)).status_code == 200

async def test_superadmin_can_create_performer(client: AsyncClient, db_session):
    h = await _user(client, db_session, "superadmin")
    r = await client.post("/admin/performers", json={
        "name": f"Act {uuid.uuid4().hex[:6]}", "performer_type": "artist",
    }, headers=h)
    assert r.status_code == 200, r.text
