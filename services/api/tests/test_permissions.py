import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.organization import Organization, OrganizationMember, OrgRole
from app.security import hash_password


async def _seed(db: AsyncSession, email: str, role: str = OrgRole.OWNER.value):
    u = User(email=email, password_hash=hash_password("pass"), role=UserRole.ORGANIZER.value, is_active=True)
    db.add(u)
    await db.flush()
    org = Organization(name=f"Org {email}", slug=f"org-{email.split('@')[0]}", verification_status="VERIFIED")
    db.add(org)
    await db.flush()
    db.add(OrganizationMember(user_id=u.id, organization_id=org.id, role=role))
    await db.commit()
    return u, org


async def _token(client: AsyncClient, email: str):
    r = await client.post("/auth/login", json={"email": email, "password": "pass"})
    return r.json()["access_token"]


@pytest.mark.asyncio
async def test_invite_and_role_change(client: AsyncClient, db_session: AsyncSession):
    u, org = await _seed(db_session, "perm1@test.com")
    token = await _token(client, "perm1@test.com")
    h = {"Authorization": f"Bearer {token}"}

    r = await client.post(f"/orgs/{org.id}/invite", json={"email": "new@test.com", "role": "viewer"}, headers=h)
    assert r.status_code == 200
    assert "token" in r.json()

    r = await client.get(f"/orgs/{org.id}/members", headers=h)
    assert r.status_code == 200
    assert len(r.json()) == 1


@pytest.mark.asyncio
async def test_finance_permission(client: AsyncClient, db_session: AsyncSession):
    u, org = await _seed(db_session, "perm2@test.com", OrgRole.VIEWER.value)
    token = await _token(client, "perm2@test.com")
    r = await client.get(f"/orgs/{org.id}/finance", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_org_isolation_members(client: AsyncClient, db_session: AsyncSession):
    u1, o1 = await _seed(db_session, "perm3a@test.com")
    u2, o2 = await _seed(db_session, "perm3b@test.com")
    t2 = await _token(client, "perm3b@test.com")
    r = await client.get(f"/orgs/{o1.id}/members", headers={"Authorization": f"Bearer {t2}"})
    assert r.status_code == 403
