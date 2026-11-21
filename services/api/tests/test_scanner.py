import pytest
from httpx import AsyncClient
from app.security import create_access_token

@pytest.mark.asyncio
async def test_scan_endpoint_exists(client: AsyncClient):
    """Smoke test – endpoint is reachable and returns structured response."""
    token = create_access_token({"sub": "1", "role": "admin"})
    headers = {"Authorization": f"Bearer {token}"}
    r = await client.post("/scanner/scan", json={"code": "SMOKE", "event_id": 999}, headers=headers)
    assert r.status_code in (200, 401, 403)
    if r.status_code == 200:
        data = r.json()
        assert "result" in data
        assert data["result"] in ("INVALID", "UNAUTHORIZED", "WRONG_EVENT")

@pytest.mark.asyncio
async def test_scan_no_auth(client: AsyncClient):
    r = await client.post("/scanner/scan", json={"code": "X", "event_id": 1})
    assert r.status_code in (401, 403)
