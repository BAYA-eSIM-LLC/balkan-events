"""Venue and performer catalog is platform-owned. Only ADMIN and SUPERADMIN may mutate it."""
import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.security import hash_password

pytestmark = pytest.mark.asyncio
_seq = 88000

def _next():
    global _seq
    _seq += 1
    return _seq

async def _user(client: AsyncClient, db: AsyncSession, role: str):
    uid = _next()
    email = f"rbac-{uid}@example.com"
    pw = hash_password("securepass123")
    await db.execute(text(
        "INSERT INTO users (id, email, password_hash, full_name, role, is_active) "
        "VALUES (:id, :email, :pw, 'RBAC', :role, true)"
    ), {"id": uid, "email": email, "pw": pw, "role": role})
    await db.commit()
    login = await client.post("/auth/login", json={"email": email, "password": "securepass123"})
    assert login.status_code == 200, login.text
    return {"Authorization": f"Bearer {login.json()['access_token']}"}

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
