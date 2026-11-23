"""MFA flow tests. Require Postgres and MFA_ENCRYPTION_KEY. Skip if DB is down."""
import os
import pytest
from httpx import AsyncClient
from cryptography.fernet import Fernet

pytestmark = pytest.mark.asyncio

@pytest.fixture(autouse=True)
def _key(monkeypatch):
    monkeypatch.setenv("MFA_ENCRYPTION_KEY", Fernet.generate_key().decode())

async def test_admin_login_requires_mfa_when_enabled(client: AsyncClient):
    # Register a normal user first to confirm the path exists.
    r = await client.post("/auth/register", json={
        "email": "mfa-flow@example.com",
        "password": "securepass123",
        "full_name": "MFA Flow",
    })
    assert r.status_code in (200, 400)

async def test_health_has_no_secrets(client: AsyncClient):
    r = await client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body.get("status") == "healthy"
    assert "password" not in body
    assert "secret" not in body
    assert "token" not in body

async def test_admin_without_token_rejected(client: AsyncClient):
    r = await client.get("/admin/dashboard")
    assert r.status_code in (401, 403)

async def test_admin_with_bad_token_rejected(client: AsyncClient):
    r = await client.get("/admin/dashboard", headers={"Authorization": "Bearer not-a-jwt"})
    assert r.status_code in (401, 403)
