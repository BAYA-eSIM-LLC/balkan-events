import pytest
from httpx import AsyncClient
from app.security import decode_token

@pytest.mark.asyncio
async def test_register_and_login(client: AsyncClient):
    reg = await client.post("/auth/register", json={
        "email": "newuser@example.com",
        "password": "securepass123",
        "full_name": "New User"
    })
    assert reg.status_code == 200
    token = reg.json()["access_token"]
    payload = decode_token(token)
    assert "sub" in payload
    assert payload.get("role") == "user"

    login = await client.post("/auth/login", json={
        "email": "newuser@example.com",
        "password": "securepass123"
    })
    assert login.status_code == 200
    assert "access_token" in login.json()

@pytest.mark.asyncio
async def test_register_duplicate(client: AsyncClient):
    await client.post("/auth/register", json={
        "email": "dupuser@example.com",
        "password": "pass123456",
        "full_name": "Dup"
    })
    second = await client.post("/auth/register", json={
        "email": "dupuser@example.com",
        "password": "pass123456",
        "full_name": "Dup"
    })
    assert second.status_code == 400

@pytest.mark.asyncio
async def test_login_invalid(client: AsyncClient):
    resp = await client.post("/auth/login", json={
        "email": "nobody@example.com",
        "password": "wrong"
    })
    assert resp.status_code == 401
