import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.organization import Organization, OrganizationMember, OrgRole
from app.models.event import Event, EventStatus
from app.security import hash_password
from datetime import datetime


async def _owner(db: AsyncSession, email: str, event_id: int):
    u = User(email=email, password_hash=hash_password("pass"), role=UserRole.ORGANIZER.value, is_active=True)
    db.add(u)
    await db.flush()
    org = Organization(name=f"S {email}", slug=f"s-{email.split('@')[0]}", verification_status="VERIFIED")
    db.add(org)
    await db.flush()
    db.add(OrganizationMember(user_id=u.id, organization_id=org.id, role=OrgRole.OWNER.value))
    event = Event(id=event_id, organization_id=org.id, title=f"E{event_id}", slug=f"s-{event_id}", start_at=datetime.utcnow(), status=EventStatus.PUBLISHED.value)
    db.add(event)
    await db.commit()
    return u, org, event


async def _token(client: AsyncClient, email: str):
    r = await client.post("/auth/login", json={"email": email, "password": "pass"})
    return r.json()["access_token"]


@pytest.mark.asyncio
async def test_register_and_revoke_device(client: AsyncClient, db_session: AsyncSession):
    u, org, event = await _owner(db_session, "sc21@test.com", 8001)
    token = await _token(client, "sc21@test.com")
    h = {"Authorization": f"Bearer {token}"}

    r = await client.post("/scanner/devices", json={"name": "Gate A", "organization_id": org.id}, headers=h)
    assert r.status_code == 200
    assert "token" in r.json()
    device_id = r.json()["id"]

    r = await client.post(f"/scanner/devices/{device_id}/revoke", headers=h)
    assert r.status_code == 200
    assert r.json()["status"] == "revoked"


@pytest.mark.asyncio
async def test_entry_point_and_attendance(client: AsyncClient, db_session: AsyncSession):
    u, org, event = await _owner(db_session, "sc21b@test.com", 8002)
    token = await _token(client, "sc21b@test.com")
    h = {"Authorization": f"Bearer {token}"}

    r = await client.post("/scanner/entry-points", json={"event_id": 8002, "name": "Main"}, headers=h)
    assert r.status_code == 200

    r = await client.get("/scanner/attendance?event_id=8002", headers=h)
    assert r.status_code == 200
    assert r.json()["scanned"] == 0


@pytest.mark.asyncio
async def test_offline_sync_limitation(client: AsyncClient, db_session: AsyncSession):
    u, org, event = await _owner(db_session, "sc21c@test.com", 8003)
    token = await _token(client, "sc21c@test.com")
    r = await client.post("/scanner/offline/sync", json=[{"qr_data": "missing", "event_id": 8003}], headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert "limitation" in r.json()
    assert "cannot guarantee" in r.json()["limitation"]


@pytest.mark.asyncio
async def test_device_token_validate_and_revoke(client: AsyncClient, db_session: AsyncSession):
    u, org, event = await _owner(db_session, "sc211@test.com", 8101)
    token = await _token(client, "sc211@test.com")
    h = {"Authorization": f"Bearer {token}"}

    r = await client.post("/scanner/devices", json={"name": "Gate", "organization_id": org.id}, headers=h)
    assert r.status_code == 200
    device_token = r.json()["token"]
    device_id = r.json()["id"]

    # Device token alone can call validate (ticket missing -> INVALID, not 401)
    r = await client.post("/scanner/validate", json={"qr_data": "none", "event_id": 8101}, headers={"X-Device-Token": device_token})
    assert r.status_code == 200
    assert r.json()["status"] == "INVALID"

    # Revoke
    r = await client.post(f"/scanner/devices/{device_id}/revoke", headers=h)
    assert r.status_code == 200

    # Revoked token rejected
    r = await client.post("/scanner/validate", json={"qr_data": "none", "event_id": 8101}, headers={"X-Device-Token": device_token})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_invalid_device_token(client: AsyncClient, db_session: AsyncSession):
    r = await client.post("/scanner/validate", json={"qr_data": "x", "event_id": 1}, headers={"X-Device-Token": "not-a-real-token"})
    assert r.status_code == 401
