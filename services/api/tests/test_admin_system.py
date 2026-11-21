import pytest
from httpx import AsyncClient
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.models.event import Event, EventStatus
from app.security import create_access_token, hash_password
from datetime import datetime

async def create_user(db, email, role=UserRole.USER.value):
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
    user = await create_user(db_session, "user1@test.com", UserRole.USER.value)
    r = await client.get("/admin/dashboard", headers=auth_header(user))
    assert r.status_code == 403

@pytest.mark.asyncio
async def test_admin_dashboard_ok(client: AsyncClient, db_session):
    admin = await create_user(db_session, "admin1@test.com", UserRole.ADMIN.value)
    r = await client.get("/admin/dashboard", headers=auth_header(admin))
    assert r.status_code == 200
    assert "users" in r.json()
    assert "note" in r.json()

@pytest.mark.asyncio
async def test_change_role_superadmin_only(client: AsyncClient, db_session):
    admin = await create_user(db_session, "admin2@test.com", UserRole.ADMIN.value)
    target = await create_user(db_session, "target1@test.com", UserRole.USER.value)
    r = await client.patch(f"/admin/users/{target.id}/role?new_role=admin", headers=auth_header(admin))
    assert r.status_code == 403

@pytest.mark.asyncio
async def test_support_ticket_access(client: AsyncClient, db_session):
    support = await create_user(db_session, "support1@test.com", UserRole.SUPPORT_ADMIN.value)
    r = await client.get("/admin/support/tickets", headers=auth_header(support))
    assert r.status_code == 200
    assert "total" in r.json()

@pytest.mark.asyncio
async def test_finance_overview(client: AsyncClient, db_session):
    fin = await create_user(db_session, "fin1@test.com", UserRole.FINANCE_ADMIN.value)
    r = await client.get("/admin/finance/overview", headers=auth_header(fin))
    assert r.status_code == 200
    assert "ledger_entries" in r.json()

@pytest.mark.asyncio
async def test_user_create_and_view_own_ticket(client: AsyncClient, db_session):
    user = await create_user(db_session, "user2@test.com", UserRole.USER.value)
    r = await client.post("/support/tickets?subject=Help&body=Need+help", headers=auth_header(user))
    assert r.status_code == 200
    tid = r.json()["id"]
    r2 = await client.get(f"/support/tickets/{tid}", headers=auth_header(user))
    assert r2.status_code == 200
    assert r2.json()["subject"] == "Help"

@pytest.mark.asyncio
async def test_user_cannot_view_foreign_ticket(client: AsyncClient, db_session):
    u1 = await create_user(db_session, "u1@test.com", UserRole.USER.value)
    u2 = await create_user(db_session, "u2@test.com", UserRole.USER.value)
    r = await client.post("/support/tickets?subject=Private&body=Secret", headers=auth_header(u1))
    tid = r.json()["id"]
    r2 = await client.get(f"/support/tickets/{tid}", headers=auth_header(u2))
    assert r2.status_code == 404

@pytest.mark.asyncio
async def test_admin_notes_crud(client: AsyncClient, db_session):
    admin = await create_user(db_session, "admin3@test.com", UserRole.ADMIN.value)
    r = await client.post("/admin/notes?entity_type=user&entity_id=1&note=Internal+note", headers=auth_header(admin))
    assert r.status_code == 200
    nid = r.json()["id"]
    r2 = await client.get("/admin/notes?entity_type=user&entity_id=1", headers=auth_header(admin))
    assert r2.status_code == 200
    assert r2.json()["total"] >= 1
    r3 = await client.patch(f"/admin/notes/{nid}?note=Updated", headers=auth_header(admin))
    assert r3.status_code == 200
    r4 = await client.delete(f"/admin/notes/{nid}", headers=auth_header(admin))
    assert r4.status_code == 200

@pytest.mark.asyncio
async def test_user_cannot_access_admin_notes(client: AsyncClient, db_session):
    user = await create_user(db_session, "user3@test.com", UserRole.USER.value)
    r = await client.get("/admin/notes", headers=auth_header(user))
    assert r.status_code == 403

@pytest.mark.asyncio
async def test_org_approve_reject(client: AsyncClient, db_session):
    reviewer = await create_user(db_session, "reviewer@test.com", UserRole.ORGANIZER_REVIEWER.value)
    org = Organization(name="Test Org", slug="test-org-1", verification_status="SUBMITTED")
    db_session.add(org)
    await db_session.commit()
    await db_session.refresh(org)
    r = await client.post(f"/admin/organizations/{org.id}/approve", headers=auth_header(reviewer))
    assert r.status_code == 200
    assert r.json()["verification_status"] == "VERIFIED"

@pytest.mark.asyncio
async def test_event_status_change(client: AsyncClient, db_session):
    mod = await create_user(db_session, "mod@test.com", UserRole.EVENT_MODERATOR.value)
    org = Organization(name="Org2", slug="org-2", verification_status="VERIFIED")
    db_session.add(org)
    await db_session.commit()
    await db_session.refresh(org)
    ev = Event(organization_id=org.id, title="Test Event", slug="test-event-1", start_at=datetime.utcnow(), status=EventStatus.SUBMITTED.value)
    db_session.add(ev)
    await db_session.commit()
    await db_session.refresh(ev)
    r = await client.post(f"/admin/events/{ev.id}/status?new_status=APPROVED", headers=auth_header(mod))
    assert r.status_code == 200
    assert r.json()["status"] == "APPROVED"

@pytest.mark.asyncio
async def test_pagination_on_users(client: AsyncClient, db_session):
    admin = await create_user(db_session, "admin4@test.com", UserRole.ADMIN.value)
    r = await client.get("/admin/users?page=1&page_size=5", headers=auth_header(admin))
    assert r.status_code == 200
    data = r.json()
    assert "total" in data and "page" in data and "page_size" in data
    assert data["page_size"] == 5
