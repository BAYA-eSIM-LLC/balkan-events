import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.organization import Organization, OrganizationMember, OrgRole
from app.security import hash_password


async def _admin(db: AsyncSession, email: str):
    u = User(email=email, password_hash=hash_password("pass"), role=UserRole.SUPERADMIN.value, is_active=True)
    db.add(u)
    await db.commit()
    return u


async def _token(client: AsyncClient, email: str):
    r = await client.post("/auth/login", json={"email": email, "password": "pass"})
    return r.json()["access_token"]


@pytest.mark.asyncio
async def test_admin_sponsor_and_package(client: AsyncClient, db_session: AsyncSession):
    await _admin(db_session, "sp1@test.com")
    token = await _token(client, "sp1@test.com")
    h = {"Authorization": f"Bearer {token}"}

    r = await client.post("/admin/sponsors", json={"name": "Acme", "level": "GOLD", "contract_value": 5000}, headers=h)
    assert r.status_code == 200

    r = await client.post("/admin/sponsors/packages", json={"name": "Gold Sponsor", "code": "GOLD", "price": 2000}, headers=h)
    assert r.status_code == 200

    r = await client.get("/admin/sponsors/analytics", headers=h)
    assert r.status_code == 200
    assert r.json()["collected_revenue"] == 0
    assert r.json()["active_sponsors"] >= 1


@pytest.mark.asyncio
async def test_sponsor_org_isolation(client: AsyncClient, db_session: AsyncSession):
    u1 = User(email="sp2a@test.com", password_hash=hash_password("pass"), role=UserRole.ORGANIZER.value, is_active=True)
    u2 = User(email="sp2b@test.com", password_hash=hash_password("pass"), role=UserRole.ORGANIZER.value, is_active=True)
    db_session.add_all([u1, u2])
    await db_session.flush()
    org = Organization(name="Sp Org", slug="sp-org", verification_status="VERIFIED")
    db_session.add(org)
    await db_session.flush()
    db_session.add(OrganizationMember(user_id=u1.id, organization_id=org.id, role=OrgRole.OWNER.value))
    await db_session.commit()

    t1 = await _token(client, "sp2a@test.com")
    t2 = await _token(client, "sp2b@test.com")

    r = await client.post("/sponsors", json={"organization_id": org.id, "name": "Private"}, headers={"Authorization": f"Bearer {t1}"})
    assert r.status_code == 200

    r = await client.get(f"/sponsors?organization_id={org.id}", headers={"Authorization": f"Bearer {t2}"})
    assert r.status_code == 403
