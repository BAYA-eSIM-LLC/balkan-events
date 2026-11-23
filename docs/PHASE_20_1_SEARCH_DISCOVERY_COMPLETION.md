# Phase 20.1 – Search & Discovery Completion

**Branch:** super-admin-dashboard  
**Commit:** ed704b1  
**Date:** 2026-11-23

## CI (PostgreSQL 16)

- **Run:** [45147585882](https://github.com/BAYA-eSIM-LLC/balkan-events/actions/runs/45147585882)
- **Tests:** **118 passed, 0 failed, 0 skipped**
- Migrations 001–022: passed

## Persistent preferences

- `user_preferences` table (migration `022_discovery`)
- `GET/PUT /me/preferences` — favorite categories, cities, followed organizers
- Survives process restart
- User can only read/write own preferences

## Search history

- `search_history` table
- `POST /me/searches` — record query and filters
- `GET /me/searches` — own recent (max 20 returned, 50 stored)
- `DELETE /me/searches` — clear own history
- `GET /events/popular-searches` — aggregated query terms only, no user ids

## SEO JSON-LD

- `GET /events/{slug}/jsonld` — Schema.org Event from real published event
- Fields: name, startDate, location; endDate and description when present
- 404 for missing or unpublished

## Infinite scroll

- `/search` loads page 1, then “Load more” appends without duplicates
- Loading and error states
- Uses existing pagination

## Tests

- Preferences persist and isolate between users
- Search history record, list, popular aggregate, clear
- JSON-LD returns Event type when event exists

## Not finished

- Infinite scroll on `/discover` (search page done)
- View history / recommendation engine
- Live screenshots
- Phase 14 leftovers: drag-and-drop seat editor, auto checkout redirect

## Constraints

Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe.

Waiting for approval before the next phase.
