import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.organization import Organization, OrganizationMember, OrgRole
from app.security import hash_password


async def _seed_admin(db: AsyncSession, email: str):
    user = User(email=email, password_hash=hash_password("pass"), role=UserRole.SUPERADMIN.value, is_active=True)
    db.add(user)
    await db.commit()
    return user


async def _token(client: AsyncClient, email: str):
    r = await client.post("/auth/login", json={"email": email, "password": "pass"})
    return r.json()["access_token"]


@pytest.mark.asyncio
async def test_admin_analytics_overview(client: AsyncClient, db_session: AsyncSession):
    await _seed_admin(db_session, "ana1@test.com")
    token = await _token(client, "ana1@test.com")
    r = await client.get("/admin/analytics/overview?period=this_month", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    d = r.json()
    assert "gross_revenue" in d
    assert "pos_revenue" in d
    assert "web_revenue" in d


@pytest.mark.asyncio
async def test_analytics_org_isolation(client: AsyncClient, db_session: AsyncSession):
    u1 = User(email="ana2a@test.com", password_hash=hash_password("pass"), role=UserRole.ORGANIZER.value, is_active=True)
    u2 = User(email="ana2b@test.com", password_hash=hash_password("pass"), role=UserRole.ORGANIZER.value, is_active=True)
    db_session.add_all([u1, u2])
    await db_session.flush()
    org = Organization(name="Ana Org", slug="ana-org", verification_status="VERIFIED")
    db_session.add(org)
    await db_session.flush()
    db_session.add(OrganizationMember(user_id=u1.id, organization_id=org.id, role=OrgRole.OWNER.value))
    await db_session.commit()

    t2 = await _token(client, "ana2b@test.com")
    r = await client.get(f"/analytics/organizer/{org.id}", headers={"Authorization": f"Bearer {t2}"})
    assert r.status_code == 403
