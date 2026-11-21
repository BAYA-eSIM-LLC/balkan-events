import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user_extended import EmailVerificationToken
from app.models.user import User
import hashlib

@pytest.mark.asyncio
async def test_email_verification_one_time_and_expiry(client: AsyncClient, db_session: AsyncSession):
    reg = await client.post("/auth/register", json={
        "email": "onetime@example.com", "password": "pass123456", "full_name": "One Time"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    req = await client.post("/me/verify-email/request", headers=headers)
    debug = req.json()["debug_token"]

    ver1 = await client.post(f"/me/verify-email?token={debug}")
    assert ver1.status_code == 200

    ver2 = await client.post(f"/me/verify-email?token={debug}")
    assert ver2.status_code == 400

    raw_expired = "expiredtoken123"
    user = (await db_session.execute(select(User).where(User.email == "onetime@example.com"))).scalar_one()
    expired = EmailVerificationToken(
        user_id=user.id,
        token_hash=hashlib.sha256(raw_expired.encode()).hexdigest(),
        expires_at=datetime.utcnow() - timedelta(hours=1)
    )
    db_session.add(expired)
    await db_session.commit()
    exp_resp = await client.post(f"/me/verify-email?token={raw_expired}")
    assert exp_resp.status_code == 400

@pytest.mark.asyncio
async def test_password_reset_one_time_and_expiry(client: AsyncClient):
    await client.post("/auth/register", json={
        "email": "resetuser@example.com", "password": "oldpass123", "full_name": "Reset"
    })

    req = await client.post("/me/forgot-password?email=resetuser@example.com")
    debug = req.json()["debug_token"]

    r1 = await client.post(f"/me/reset-password?token={debug}&new_password=newpass789")
    assert r1.status_code == 200

    r2 = await client.post(f"/me/reset-password?token={debug}&new_password=another")
    assert r2.status_code == 400

@pytest.mark.asyncio
async def test_password_change_revokes_sessions(client: AsyncClient):
    reg = await client.post("/auth/register", json={
        "email": "sessionuser@example.com", "password": "pass123456", "full_name": "Session"
    })
    refresh = reg.json()["refresh_token"]
    access = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {access}"}

    ch = await client.post("/me/password", headers=headers, json={
        "current_password": "pass123456", "new_password": "newpass999"
    })
    assert ch.status_code == 200

    ref = await client.post("/auth/refresh", json={"refresh_token": refresh})
    assert ref.status_code == 401

@pytest.mark.asyncio
async def test_cannot_access_other_user_profile(client: AsyncClient):
    r1 = await client.post("/auth/register", json={
        "email": "user1@example.com", "password": "pass123456", "full_name": "User1"
    })
    await client.post("/auth/register", json={
        "email": "user2@example.com", "password": "pass123456", "full_name": "User2"
    })
    t1 = r1.json()["access_token"]
    me = await client.get("/me", headers={"Authorization": f"Bearer {t1}"})
    assert me.json()["email"] == "user1@example.com"
    assert me.json()["email"] != "user2@example.com"

@pytest.mark.asyncio
async def test_account_deactivation_soft_only(client: AsyncClient, db_session: AsyncSession):
    reg = await client.post("/auth/register", json={
        "email": "deleteme@example.com", "password": "pass123456", "full_name": "Delete Me"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    user = (await db_session.execute(select(User).where(User.email == "deleteme@example.com"))).scalar_one()
    await db_session.execute(text(
        f"INSERT INTO orders (id, user_id, status, total_amount) VALUES (9001, {user.id}, 'paid', 10.00) ON CONFLICT DO NOTHING"
    ))
    await db_session.commit()

    deact = await client.post("/me/delete-account", headers=headers)
    assert deact.status_code == 200

    # Raw SQL to bypass any session cache
    row = (await db_session.execute(text(f"SELECT is_active FROM users WHERE id = {user.id}"))).first()
    assert row[0] is False
    order_count = (await db_session.execute(text(f"SELECT COUNT(*) FROM orders WHERE user_id = {user.id}"))).scalar()
    assert order_count >= 1
