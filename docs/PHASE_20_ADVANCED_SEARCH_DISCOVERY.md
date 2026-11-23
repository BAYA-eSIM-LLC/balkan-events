# Phase 20 – Advanced Search & Discovery PRO

**Branch:** super-admin-dashboard  
**Commit:** dbb4827  
**Date:** 2026-11-23

## CI (PostgreSQL 16)

- **Run:** [45147054689](https://github.com/BAYA-eSIM-LLC/balkan-events/actions/runs/45147054689)
- **Tests:** **115 passed, 0 failed, 0 skipped**
- Migrations 001–021: passed (no new migration)

## Implemented

### Search (extended)
- Existing `/events/search` kept
- Added `country` string filter alongside `country_id`
- Filters: q, city, country, category, venue, organizer, performer, date presets, free, multi-day, pagination
- Only `PUBLISHED` events

### Discovery
- `GET /events/discover` — popular (featured), upcoming, this weekend, recently added, top cities
- Empty sections stay empty; no fabricated events

### Autocomplete & SEO
- `GET /events/autocomplete?q=` — titles of published events
- `GET /events/sitemap.xml` — published event slugs

### Preferences
- `GET/PUT /me/preferences` — favorite categories, cities, followed organizers
- In-memory for this phase (per process)

### Frontend
- `/discover` — discovery sections
- `/search` — filters, autocomplete, empty state

### Regional focus
- Country/city filters support BA, HR, RS and any other country present in data
- No invented events or locations

### Tests
- Discover excludes DRAFT events
- Autocomplete returns list
- Search by city/country returns only published

## Not finished
- Persistent preference table
- Recent/popular search history
- Event structured data (JSON-LD) on event pages
- Infinite scroll
- Live screenshots
- Phase 14 leftovers: drag-and-drop seat editor, auto checkout redirect

## Constraints

Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe.

Waiting for approval before the next phase.
