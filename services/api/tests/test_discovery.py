import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime, timedelta


@pytest.mark.asyncio
async def test_discover_only_published(client: AsyncClient, db_session: AsyncSession):
    await db_session.execute(text(
        "INSERT INTO organizations (id, name, slug) VALUES (7001, 'DOrg', 'dorg') ON CONFLICT DO NOTHING"
    ))
    await db_session.execute(text(
        "INSERT INTO events (id, organization_id, title, slug, start_at, status, is_published, city, country) "
        "VALUES (7001, 7001, 'Public Show', 'public-show', NOW() + INTERVAL '2 days', 'PUBLISHED', true, 'Sarajevo', 'BA') "
        "ON CONFLICT DO NOTHING"
    ))
    await db_session.execute(text(
        "INSERT INTO events (id, organization_id, title, slug, start_at, status, is_published, city) "
        "VALUES (7002, 7001, 'Secret Draft', 'secret-draft', NOW() + INTERVAL '2 days', 'DRAFT', false, 'Zagreb') "
        "ON CONFLICT DO NOTHING"
    ))
    await db_session.commit()

    r = await client.get("/events/discover")
    assert r.status_code == 200
    titles = [e["title"] for e in r.json()["upcoming"]]
    assert "Public Show" in titles
    assert "Secret Draft" not in titles


@pytest.mark.asyncio
async def test_autocomplete(client: AsyncClient, db_session: AsyncSession):
    r = await client.get("/events/autocomplete?q=Pub")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_search_city_country(client: AsyncClient, db_session: AsyncSession):
    r = await client.get("/events/search?city=Sarajevo&country=BA")
    assert r.status_code == 200
    results = r.json()["results"]
    assert all(e["status"] == "PUBLISHED" for e in results)
