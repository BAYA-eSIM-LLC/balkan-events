import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    response = await client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "testpass123",
        "full_name": "Test User"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

@pytest.mark.asyncio
async def test_register_duplicate(client: AsyncClient):
    await client.post("/auth/register", json={
        "email": "dup@example.com",
        "password": "testpass123",
        "full_name": "Dup User"
    })
    response = await client.post("/auth/register", json={
        "email": "dup@example.com",
        "password": "testpass123",
        "full_name": "Dup User"
    })
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    await client.post("/auth/register", json={
        "email": "login@example.com",
        "password": "testpass123",
        "full_name": "Login User"
    })
    response = await client.post("/auth/login", json={
        "email": "login@example.com",
        "password": "testpass123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

@pytest.mark.asyncio
async def test_login_invalid(client: AsyncClient):
    response = await client.post("/auth/login", json={
        "email": "wrong@example.com",
        "password": "wrongpass"
    })
    assert response.status_code == 401
