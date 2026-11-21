import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_events(client: AsyncClient):
    response = await client.get("/events/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_event_not_found(client: AsyncClient):
    response = await client.get("/events/nonexistent-slug")
    assert response.status_code == 404
