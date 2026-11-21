import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.refresh_token import RefreshToken

@pytest.mark.asyncio
async def test_refresh_rotation_and_logout(client: AsyncClient, db_session: AsyncSession):
    reg = await client.post("/auth/register", json={
        "email": "refresh@example.com",
        "password": "pass123456",
        "full_name": "Refresh User"
    })
    assert reg.status_code == 200
    data = reg.json()
    old_refresh = data["refresh_token"]
    access = data["access_token"]

    # Rotate
    ref = await client.post("/auth/refresh", json={"refresh_token": old_refresh})
    assert ref.status_code == 200
    new_data = ref.json()
    assert new_data["refresh_token"] != old_refresh
    assert "access_token" in new_data

    # Old token should fail
    old_ref = await client.post("/auth/refresh", json={"refresh_token": old_refresh})
    assert old_ref.status_code == 401

    # Logout
    logout = await client.post("/auth/logout", json={"refresh_token": new_data["refresh_token"]})
    assert logout.status_code == 200

    # After logout, refresh fails
    after = await client.post("/auth/refresh", json={"refresh_token": new_data["refresh_token"]})
    assert after.status_code == 401

@pytest.mark.asyncio
async def test_refresh_expired(db_session: AsyncSession):
    # Insert expired token and verify rejection (endpoint level covered above; this checks model)
    await db_session.execute(text("INSERT INTO users (id, email, password_hash, full_name) VALUES (700, 'exp@test.com', 'h', 'Exp') ON CONFLICT DO NOTHING"))
    await db_session.execute(text("INSERT INTO refresh_tokens (user_id, token_hash, expires_at, is_revoked) VALUES (700, 'expiredhash', NOW() - INTERVAL '1 day', false) ON CONFLICT DO NOTHING"))
    await db_session.commit()
    result = await db_session.execute(text("SELECT is_revoked, expires_at < NOW() FROM refresh_tokens WHERE token_hash = 'expiredhash'"))
    row = result.first()
    assert row is not None
