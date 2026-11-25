import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.organization import Organization, OrganizationMember, OrgRole
from app.security import hash_password

@pytest.mark.asyncio
async def test_create_org_and_isolation(client: AsyncClient, db_session: AsyncSession):
    u1 = User(email="org1@example.com", password_hash=hash_password("pass123456"), full_name="O1", role="organizer")
    u2 = User(email="org2@example.com", password_hash=hash_password("pass123456"), full_name="O2", role="organizer")
    db_session.add_all([u1, u2])
    await db_session.commit()

    login1 = await client.post("/auth/login", json={"email": "org1@example.com", "password": "pass123456"})
    h1 = {"Authorization": f"Bearer {login1.json()['access_token']}"}
    login2 = await client.post("/auth/login", json={"email": "org2@example.com", "password": "pass123456"})
    h2 = {"Authorization": f"Bearer {login2.json()['access_token']}"}

    create = await client.post("/organizer/organizations", headers=h1, json={"name": "My Org", "org_type": "company"})
    assert create.status_code == 200
    oid = create.json()["id"]
    assert create.json()["verification_status"] == "NOT_SUBMITTED"

    # u2 cannot see
    get2 = await client.get(f"/organizer/organizations/{oid}", headers=h2)
    assert get2.status_code == 403

    # u1 can see
    get1 = await client.get(f"/organizer/organizations/{oid}", headers=h1)
    assert get1.status_code == 200

@pytest.mark.asyncio
async def test_verification_flow(client: AsyncClient, db_session: AsyncSession):
    user = User(email="ver@example.com", password_hash=hash_password("pass123456"), full_name="Ver", role="organizer")
    admin = User(email="admver@example.com", password_hash=hash_password("pass123456"), full_name="Adm", role="admin")
    db_session.add_all([user, admin])
    await db_session.commit()

    login = await client.post("/auth/login", json={"email": "ver@example.com", "password": "pass123456"})
    h = {"Authorization": f"Bearer {login.json()['access_token']}"}
    create = await client.post("/organizer/organizations", headers=h, json={"name": "Ver Org"})
    oid = create.json()["id"]

    sub = await client.post(f"/organizer/organizations/{oid}/verification/submit", headers=h)
    assert sub.status_code == 200
    assert sub.json()["verification_status"] == "PENDING_REVIEW"

    login_a = await client.post("/auth/login", json={"email": "admver@example.com", "password": "pass123456"})
    ha = {"Authorization": f"Bearer {login_a.json()['access_token']}"}
    approve = await client.post(f"/admin/organizations/{oid}/approve", headers=ha)
    assert approve.status_code == 200
    assert approve.json()["verification_status"] == "VERIFIED"

@pytest.mark.asyncio
async def test_dashboard_no_fake_finance(client: AsyncClient, db_session: AsyncSession):
    user = User(email="dash@example.com", password_hash=hash_password("pass123456"), full_name="Dash", role="organizer")
    db_session.add(user)
    await db_session.commit()

    login = await client.post("/auth/login", json={"email": "dash@example.com", "password": "pass123456"})
    h = {"Authorization": f"Bearer {login.json()['access_token']}"}
    create = await client.post("/organizer/organizations", headers=h, json={"name": "Dash Org"})
    oid = create.json()["id"]

    dash = await client.get(f"/organizer/dashboard?org_id={oid}", headers=h)
    assert dash.status_code == 200
    # available can be False or 0.0 depending on implementation
    avail = dash.json()["finance"]["available"]
    assert avail is False or avail == 0.0

    fin = await client.get(f"/organizer/reports/finance?org_id={oid}", headers=h)
    assert fin.status_code == 200
    fin_avail = fin.json()["available"]
    assert fin_avail is False or fin_avail == 0.0

@pytest.mark.asyncio
async def test_cannot_remove_last_owner(client: AsyncClient, db_session: AsyncSession):
    user = User(email="own@example.com", password_hash=hash_password("pass123456"), full_name="Own", role="organizer")
    db_session.add(user)
    await db_session.commit()

    login = await client.post("/auth/login", json={"email": "own@example.com", "password": "pass123456"})
    h = {"Authorization": f"Bearer {login.json()['access_token']}"}
    create = await client.post("/organizer/organizations", headers=h, json={"name": "Own Org"})
    oid = create.json()["id"]

    members = await client.get(f"/organizer/members?org_id={oid}", headers=h)
    mid = members.json()[0]["id"]

    remove = await client.delete(f"/organizer/members/{mid}?org_id={oid}", headers=h)
    assert remove.status_code == 400
