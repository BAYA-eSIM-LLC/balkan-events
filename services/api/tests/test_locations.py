import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.location import Country, City, Region
from app.models.event import EventCategory

@pytest.mark.asyncio
async def test_countries_list_and_detail(client: AsyncClient, db_session: AsyncSession):
    # Seed minimal
    c = Country(iso_alpha2="BA", iso_alpha3="BIH", name_en="Bosnia and Herzegovina", name_local="Bosna i Hercegovina", phone_code="+387", currency_code="BAM")
    db_session.add(c)
    await db_session.commit()
    await db_session.refresh(c)

    r = await client.get("/locations/countries")
    assert r.status_code == 200
    assert any(x["iso_alpha2"] == "BA" for x in r.json())

    d = await client.get(f"/locations/countries/{c.id}")
    assert d.status_code == 200
    assert d.json()["iso_alpha3"] == "BIH"

    missing = await client.get("/locations/countries/999999")
    assert missing.status_code == 404

@pytest.mark.asyncio
async def test_cities_search_and_by_country(client: AsyncClient, db_session: AsyncSession):
    c = Country(iso_alpha2="HR", iso_alpha3="HRV", name_en="Croatia", phone_code="+385", currency_code="EUR")
    db_session.add(c)
    await db_session.commit()
    await db_session.refresh(c)

    city = City(country_id=c.id, name="Zagreb", timezone="Europe/Zagreb", latitude=45.8150, longitude=15.9819)
    db_session.add(city)
    await db_session.commit()

    by_country = await client.get(f"/locations/countries/{c.id}/cities")
    assert by_country.status_code == 200
    assert any(x["name"] == "Zagreb" for x in by_country.json())

    search = await client.get("/locations/cities?q=Zag")
    assert search.status_code == 200
    assert any(x["name"] == "Zagreb" for x in search.json())

@pytest.mark.asyncio
async def test_categories_hierarchy(client: AsyncClient, db_session: AsyncSession):
    parent = EventCategory(name="Sport", slug="sport-test", sort_order=1)
    db_session.add(parent)
    await db_session.commit()
    await db_session.refresh(parent)

    child = EventCategory(name="Football", slug="football-test", parent_id=parent.id, sort_order=1)
    db_session.add(child)
    await db_session.commit()

    roots = await client.get("/categories")
    assert roots.status_code == 200

    detail = await client.get(f"/categories/{parent.id}")
    assert detail.status_code == 200
    assert any(ch["slug"] == "football-test" for ch in detail.json()["children"])

@pytest.mark.asyncio
async def test_duplicate_iso_rejected(db_session: AsyncSession):
    c1 = Country(iso_alpha2="RS", iso_alpha3="SRB", name_en="Serbia")
    db_session.add(c1)
    await db_session.commit()

    c2 = Country(iso_alpha2="RS", iso_alpha3="XXX", name_en="Duplicate")
    db_session.add(c2)
    with pytest.raises(Exception):
        await db_session.commit()
    await db_session.rollback()
