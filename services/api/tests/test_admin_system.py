import pytest
from httpx import AsyncClient
from app.models.user import User, UserRole
from app.security import create_access_token
from sqlalchemy import select

async def create_user(db, email, role=UserRole.USER.value):
    from app.security import hash_password
    user = User(email=email, password_hash=hash_password("test123"), role=role, is_active=True, is_verified=True)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

def auth_header(user):
    token = create_access_token({"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_admin_dashboard_requires_role(client: AsyncClient, db_session):
    user = await create_user(db_session, "user@test.com", UserRole.USER.value)
    r = await client.get("/admin/dashboard", headers=auth_header(user))
    assert r.status_code == 403

@pytest.mark.asyncio
async def test_admin_dashboard_ok(client: AsyncClient, db_session):
    admin = await create_user(db_session, "admin@test.com", UserRole.ADMIN.value)
    r = await client.get("/admin/dashboard", headers=auth_header(admin))
    assert r.status_code == 200
    data = r.json()
    assert "users" in data
    assert "note" in data

@pytest.mark.asyncio
async def test_change_role_superadmin_only(client: AsyncClient, db_session):
    admin = await create_user(db_session, "admin2@test.com", UserRole.ADMIN.value)
    target = await create_user(db_session, "target@test.com", UserRole.USER.value)
    r = await client.patch(f"/admin/users/{target.id}/role?new_role=admin", headers=auth_header(admin))
    assert r.status_code == 403

@pytest.mark.asyncio
async def test_support_ticket_access(client: AsyncClient, db_session):
    support = await create_user(db_session, "support@test.com", UserRole.SUPPORT_ADMIN.value)
    r = await client.get("/admin/support/tickets", headers=auth_header(support))
    assert r.status_code == 200

@pytest.mark.asyncio
async def test_finance_overview(client: AsyncClient, db_session):
    fin = await create_user(db_session, "fin@test.com", UserRole.FINANCE_ADMIN.value)
    r = await client.get("/admin/finance/overview", headers=auth_header(fin))
    assert r.status_code == 200
    assert "ledger_entries" in r.json()
