import pytest
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

@pytest.mark.asyncio
async def test_list_events_empty(client: AsyncClient):
    resp = await client.get("/events/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

@pytest.mark.asyncio
async def test_create_and_list_event(client: AsyncClient, db_session: AsyncSession):
    await db_session.execute(text("INSERT INTO organizations (id, name, slug) VALUES (400, 'Evt Org', 'evt-org') ON CONFLICT DO NOTHING"))
    await db_session.execute(text("INSERT INTO events (id, organization_id, title, slug, start_at, is_published, city) VALUES (400, 400, 'Public Event', 'public-event', NOW() + INTERVAL '2 days', true, 'Sarajevo') ON CONFLICT DO NOTHING"))
    await db_session.commit()

    resp = await client.get("/events/")
    assert resp.status_code == 200
    data = resp.json()
    assert any(e["slug"] == "public-event" for e in data)

    detail = await client.get("/events/public-event")
    assert detail.status_code == 200
    assert detail.json()["title"] == "Public Event"
