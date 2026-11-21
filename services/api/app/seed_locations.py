"""Idempotent seed for countries, cities, regions, categories.
Sources: ISO 3166-1, ISO 4217, ITU-T E.164 (official codes only).
Run manually or via admin endpoint after migration.
"""
import asyncio
from sqlalchemy import select
from app.database import async_session
from app.models.location import Country, City, Region
from app.models.event import EventCategory

COUNTRIES = [
    {"iso_alpha2": "BA", "iso_alpha3": "BIH", "name_en": "Bosnia and Herzegovina", "name_local": "Bosna i Hercegovina", "phone_code": "+387", "currency_code": "BAM"},
    {"iso_alpha2": "HR", "iso_alpha3": "HRV", "name_en": "Croatia", "name_local": "Hrvatska", "phone_code": "+385", "currency_code": "EUR"},
    {"iso_alpha2": "RS", "iso_alpha3": "SRB", "name_en": "Serbia", "name_local": "Srbija", "phone_code": "+381", "currency_code": "RSD"},
    {"iso_alpha2": "ME", "iso_alpha3": "MNE", "name_en": "Montenegro", "name_local": "Crna Gora", "phone_code": "+382", "currency_code": "EUR"},
    {"iso_alpha2": "SI", "iso_alpha3": "SVN", "name_en": "Slovenia", "name_local": "Slovenija", "phone_code": "+386", "currency_code": "EUR"},
    {"iso_alpha2": "MK", "iso_alpha3": "MKD", "name_en": "North Macedonia", "name_local": "Severna Makedonija", "phone_code": "+389", "currency_code": "MKD"},
    {"iso_alpha2": "AL", "iso_alpha3": "ALB", "name_en": "Albania", "name_local": "Shqipëria", "phone_code": "+355", "currency_code": "ALL"},
    {"iso_alpha2": "XK", "iso_alpha3": "XKX", "name_en": "Kosovo", "name_local": "Kosova", "phone_code": "+383", "currency_code": "EUR"},
    {"iso_alpha2": "DE", "iso_alpha3": "DEU", "name_en": "Germany", "name_local": "Deutschland", "phone_code": "+49", "currency_code": "EUR"},
    {"iso_alpha2": "AT", "iso_alpha3": "AUT", "name_en": "Austria", "name_local": "Österreich", "phone_code": "+43", "currency_code": "EUR"},
    {"iso_alpha2": "FR", "iso_alpha3": "FRA", "name_en": "France", "name_local": "France", "phone_code": "+33", "currency_code": "EUR"},
    {"iso_alpha2": "IT", "iso_alpha3": "ITA", "name_en": "Italy", "name_local": "Italia", "phone_code": "+39", "currency_code": "EUR"},
    {"iso_alpha2": "GB", "iso_alpha3": "GBR", "name_en": "United Kingdom", "name_local": "United Kingdom", "phone_code": "+44", "currency_code": "GBP"},
    {"iso_alpha2": "ES", "iso_alpha3": "ESP", "name_en": "Spain", "name_local": "España", "phone_code": "+34", "currency_code": "EUR"},
    {"iso_alpha2": "NL", "iso_alpha3": "NLD", "name_en": "Netherlands", "name_local": "Nederland", "phone_code": "+31", "currency_code": "EUR"},
    {"iso_alpha2": "PL", "iso_alpha3": "POL", "name_en": "Poland", "name_local": "Polska", "phone_code": "+48", "currency_code": "PLN"},
    {"iso_alpha2": "CZ", "iso_alpha3": "CZE", "name_en": "Czechia", "name_local": "Česko", "phone_code": "+420", "currency_code": "CZK"},
    {"iso_alpha2": "HU", "iso_alpha3": "HUN", "name_en": "Hungary", "name_local": "Magyarország", "phone_code": "+36", "currency_code": "HUF"},
    {"iso_alpha2": "RO", "iso_alpha3": "ROU", "name_en": "Romania", "name_local": "România", "phone_code": "+40", "currency_code": "RON"},
    {"iso_alpha2": "BG", "iso_alpha3": "BGR", "name_en": "Bulgaria", "name_local": "България", "phone_code": "+359", "currency_code": "BGN"},
    {"iso_alpha2": "GR", "iso_alpha3": "GRC", "name_en": "Greece", "name_local": "Ελλάδα", "phone_code": "+30", "currency_code": "EUR"},
    {"iso_alpha2": "US", "iso_alpha3": "USA", "name_en": "United States", "name_local": "United States", "phone_code": "+1", "currency_code": "USD"},
]

CITIES = [
    {"country": "BA", "name": "Sarajevo", "timezone": "Europe/Sarajevo", "latitude": 43.8563, "longitude": 18.4131},
    {"country": "BA", "name": "Banja Luka", "timezone": "Europe/Sarajevo", "latitude": 44.7722, "longitude": 17.1910},
    {"country": "HR", "name": "Zagreb", "timezone": "Europe/Zagreb", "latitude": 45.8150, "longitude": 15.9819},
    {"country": "HR", "name": "Split", "timezone": "Europe/Zagreb", "latitude": 43.5081, "longitude": 16.4402},
    {"country": "RS", "name": "Belgrade", "name_alt": "Beograd", "timezone": "Europe/Belgrade", "latitude": 44.7866, "longitude": 20.4489},
    {"country": "RS", "name": "Novi Sad", "timezone": "Europe/Belgrade", "latitude": 45.2671, "longitude": 19.8335},
    {"country": "ME", "name": "Podgorica", "timezone": "Europe/Podgorica", "latitude": 42.4304, "longitude": 19.2594},
    {"country": "SI", "name": "Ljubljana", "timezone": "Europe/Ljubljana", "latitude": 46.0569, "longitude": 14.5058},
    {"country": "DE", "name": "Berlin", "timezone": "Europe/Berlin", "latitude": 52.5200, "longitude": 13.4050},
    {"country": "AT", "name": "Vienna", "name_alt": "Wien", "timezone": "Europe/Vienna", "latitude": 48.2082, "longitude": 16.3738},
    {"country": "FR", "name": "Paris", "timezone": "Europe/Paris", "latitude": 48.8566, "longitude": 2.3522},
    {"country": "IT", "name": "Rome", "name_alt": "Roma", "timezone": "Europe/Rome", "latitude": 41.9028, "longitude": 12.4964},
    {"country": "GB", "name": "London", "timezone": "Europe/London", "latitude": 51.5074, "longitude": -0.1278},
]

REGIONS = [
    {"code": "BALKAN", "name_en": "Balkan", "description": "Western Balkans and surrounding"},
    {"code": "CENTRAL_EU", "name_en": "Central Europe"},
    {"code": "WESTERN_EU", "name_en": "Western Europe"},
    {"code": "EASTERN_EU", "name_en": "Eastern Europe"},
    {"code": "NORTHERN_EU", "name_en": "Northern Europe"},
    {"code": "SOUTHERN_EU", "name_en": "Southern Europe"},
    {"code": "REST_WORLD", "name_en": "Rest of World"},
]

CATEGORIES = [
    {"name": "Concerts", "slug": "concerts", "sort_order": 1},
    {"name": "Festivals", "slug": "festivals", "sort_order": 2},
    {"name": "Clubs & Nightlife", "slug": "clubs-nightlife", "sort_order": 3},
    {"name": "Sport", "slug": "sport", "sort_order": 4},
    {"name": "Theatre", "slug": "theatre", "sort_order": 5},
    {"name": "Culture", "slug": "culture", "sort_order": 6},
    {"name": "Exhibitions & Museums", "slug": "exhibitions-museums", "sort_order": 7},
    {"name": "Conferences", "slug": "conferences", "sort_order": 8},
    {"name": "Fairs", "slug": "fairs", "sort_order": 9},
    {"name": "Business Events", "slug": "business", "sort_order": 10},
    {"name": "Family Events", "slug": "family", "sort_order": 11},
    {"name": "Other", "slug": "other", "sort_order": 12},
]

SUBCATEGORIES = [
    {"parent": "sport", "name": "Football", "slug": "football", "sort_order": 1},
    {"parent": "sport", "name": "Basketball", "slug": "basketball", "sort_order": 2},
    {"parent": "sport", "name": "Tennis", "slug": "tennis", "sort_order": 3},
    {"parent": "sport", "name": "Other Sports", "slug": "other-sports", "sort_order": 4},
]

async def seed():
    async with async_session() as db:
        for r in REGIONS:
            existing = (await db.execute(select(Region).where(Region.code == r["code"]))).scalar_one_or_none()
            if not existing:
                db.add(Region(**r))
        await db.commit()

        for c in COUNTRIES:
            existing = (await db.execute(select(Country).where(Country.iso_alpha2 == c["iso_alpha2"]))).scalar_one_or_none()
            if not existing:
                db.add(Country(**c))
        await db.commit()

        for city in CITIES:
            country = (await db.execute(select(Country).where(Country.iso_alpha2 == city["country"]))).scalar_one()
            existing = (await db.execute(select(City).where(City.country_id == country.id, City.name == city["name"]))).scalar_one_or_none()
            if not existing:
                db.add(City(country_id=country.id, name=city["name"], name_alt=city.get("name_alt"), timezone=city["timezone"], latitude=city["latitude"], longitude=city["longitude"]))
        await db.commit()

        for cat in CATEGORIES:
            existing = (await db.execute(select(EventCategory).where(EventCategory.slug == cat["slug"]))).scalar_one_or_none()
            if not existing:
                db.add(EventCategory(**cat))
        await db.commit()

        for sub in SUBCATEGORIES:
            parent = (await db.execute(select(EventCategory).where(EventCategory.slug == sub["parent"]))).scalar_one()
            existing = (await db.execute(select(EventCategory).where(EventCategory.slug == sub["slug"]))).scalar_one_or_none()
            if not existing:
                db.add(EventCategory(name=sub["name"], slug=sub["slug"], parent_id=parent.id, sort_order=sub["sort_order"]))
        await db.commit()
        print("Seed complete (idempotent)")

if __name__ == "__main__":
    asyncio.run(seed())
