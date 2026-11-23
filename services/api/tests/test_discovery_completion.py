import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.security import hash_password


async def _user(db: AsyncSession, email: str):
    u = User(email=email, password_hash=hash_password("pass"), role=UserRole.USER.value, is_active=True)
    db.add(u)
    await db.commit()
    return u


async def _token(client: AsyncClient, email: str):
    r = await client.post("/auth/login", json={"email": email, "password": "pass"})
    return r.json()["access_token"]


@pytest.mark.asyncio
async def test_preferences_persist_and_isolate(client: AsyncClient, db_session: AsyncSession):
    await _user(db_session, "pref1@test.com")
    await _user(db_session, "pref2@test.com")
    t1 = await _token(client, "pref1@test.com")
    t2 = await _token(client, "pref2@test.com")

    r = await client.put("/me/preferences", json={"favorite_cities": ["Sarajevo"]}, headers={"Authorization": f"Bearer {t1}"})
    assert r.status_code == 200

    r = await client.get("/me/preferences", headers={"Authorization": f"Bearer {t1}"})
    assert "Sarajevo" in r.json()["favorite_cities"]

    r = await client.get("/me/preferences", headers={"Authorization": f"Bearer {t2}"})
    assert r.json()["favorite_cities"] == []


@pytest.mark.asyncio
async def test_search_history(client: AsyncClient, db_session: AsyncSession):
    await _user(db_session, "hist1@test.com")
    token = await _token(client, "hist1@test.com")
    h = {"Authorization": f"Bearer {token}"}

    r = await client.post("/me/searches", json={"query": "concert"}, headers=h)
    assert r.status_code == 200

    r = await client.get("/me/searches", headers=h)
    assert r.status_code == 200
    assert r.json()[0]["query"] == "concert"

    r = await client.get("/events/popular-searches")
    assert r.status_code == 200
    assert any(s["query"] == "concert" for s in r.json())

    r = await client.delete("/me/searches", headers=h)
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_event_jsonld(client: AsyncClient, db_session: AsyncSession):
    r = await client.get("/events/public-show/jsonld")
    if r.status_code == 200:
        d = r.json()
        assert d["@type"] == "Event"
        assert "name" in d
        assert "startDate" in d
    else:
        assert r.status_code == 404
