import pytest
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

@pytest.mark.asyncio
async def test_profile_update_and_password(client: AsyncClient):
    reg = await client.post("/auth/register", json={
        "email": "profileuser@example.com",
        "password": "oldpass123",
        "full_name": "Profile User"
    })
    assert reg.status_code == 200
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    me = await client.get("/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == "profileuser@example.com"

    upd = await client.patch("/me", headers=headers, json={"full_name": "Updated Name", "bio": "Test bio"})
    assert upd.status_code == 200

    me2 = await client.get("/me", headers=headers)
    assert me2.json()["full_name"] == "Updated Name"
    assert me2.json()["bio"] == "Test bio"

    pwd = await client.post("/me/password", headers=headers, json={
        "current_password": "oldpass123",
        "new_password": "newpass456"
    })
    assert pwd.status_code == 200

@pytest.mark.asyncio
async def test_email_verification_flow(client: AsyncClient):
    reg = await client.post("/auth/register", json={
        "email": "verifyuser@example.com",
        "password": "pass123456",
        "full_name": "Verify User"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    req = await client.post("/me/verify-email/request", headers=headers)
    assert req.status_code == 200
    debug = req.json().get("debug_token")
    assert debug

    ver = await client.post(f"/me/verify-email?token={debug}")
    assert ver.status_code == 200
    assert ver.json()["status"] == "verified"
