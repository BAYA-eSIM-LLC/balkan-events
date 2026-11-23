import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.organization import Organization, OrganizationMember, OrgRole
from app.security import hash_password
from datetime import datetime


async def _seed(db: AsyncSession, email: str):
    user = User(email=email, password_hash=hash_password("pass"), role=UserRole.ORGANIZER.value, is_active=True)
    db.add(user)
    await db.flush()
    org = Organization(name=f"POS {email}", slug=f"pos-{email.split('@')[0]}", verification_status="VERIFIED")
    db.add(org)
    await db.flush()
    db.add(OrganizationMember(user_id=user.id, organization_id=org.id, role=OrgRole.OWNER.value))
    await db.commit()
    return user, org


async def _token(client: AsyncClient, email: str):
    r = await client.post("/auth/login", json={"email": email, "password": "pass"})
    return r.json()["access_token"]


@pytest.mark.asyncio
async def test_create_point_open_register(client: AsyncClient, db_session: AsyncSession):
    user, org = await _seed(db_session, "pos1@test.com")
    token = await _token(client, "pos1@test.com")
    h = {"Authorization": f"Bearer {token}"}

    r = await client.post("/pos/sales-points", json={"organization_id": org.id, "name": "Box"}, headers=h)
    assert r.status_code == 200
    pid = r.json()["id"]

    r = await client.post("/pos/registers/open", json={"sales_point_id": pid, "opening_balance": 50}, headers=h)
    assert r.status_code == 200
    rid = r.json()["id"]

    r = await client.post(f"/pos/registers/{rid}/close", json={"closing_balance": 50}, headers=h)
    assert r.status_code == 200
    assert r.json()["variance"] == 0


@pytest.mark.asyncio
async def test_pos_org_isolation(client: AsyncClient, db_session: AsyncSession):
    u1, o1 = await _seed(db_session, "pos2a@test.com")
    u2, o2 = await _seed(db_session, "pos2b@test.com")
    t1 = await _token(client, "pos2a@test.com")
    t2 = await _token(client, "pos2b@test.com")

    r = await client.post("/pos/sales-points", json={"organization_id": o1.id, "name": "Private"}, headers={"Authorization": f"Bearer {t1}"})
    pid = r.json()["id"]

    r = await client.get(f"/pos/sales-points?organization_id={o1.id}", headers={"Authorization": f"Bearer {t2}"})
    assert r.status_code == 403
