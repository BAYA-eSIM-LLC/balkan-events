# Phase 18 – Sponsors & Monetization PRO

**Branch:** super-admin-dashboard  
**Commit:** aa7bf7a  
**Date:** 2026-11-23

## CI (PostgreSQL 16)

- **Run:** [45141841022](https://github.com/BAYA-eSIM-LLC/balkan-events/actions/runs/45141841022)
- **Tests:** **90 passed, 0 failed, 0 skipped**
- Migrations 001–020: passed

## Implemented

### Models
- `Sponsor` — name, logo, website, contact, category, level, status, contract dates, contract_value (agreed, not collected)
- `SponsorPackage` — Title/Main/Gold/Silver/Partner/Media style packages with price, duration, max positions, benefits
- `SponsorPlacement` — position (HOMEPAGE, EVENT_PAGE, EVENT_HEADER, EVENT_FOOTER, ORGANIZER, PROMO), sort order, active, date window, impressions, clicks

### Migration
- `020_sponsors`

### API
- `POST /admin/sponsors`, `GET /admin/sponsors`, `PATCH /admin/sponsors/{id}`
- `POST /admin/sponsors/packages`, `GET /admin/sponsors/packages`
- `GET /admin/sponsors/analytics` — active count, agreed value, collected=0, impressions, clicks
- `POST /sponsors`, `GET /sponsors?organization_id=` — organizer, org isolation
- `POST /sponsors/placements`
- `POST /sponsors/placements/{id}/click`
- `GET /public/sponsors?position=&event_id=` — active placements, increments impressions

### Frontend
- `/admin/sponsors`
- `/admin/sponsors/packages`
- `/admin/sponsors/analytics`
- `/organizer/sponsors`

### Tests
- Admin create sponsor and package, analytics shows collected_revenue = 0
- Org isolation (403 for non-member)

## Not finished

- Logo file upload validation (URL field only)
- Public event page rendering of sponsor logos (API ready)
- Live screenshots
- Phase 14 leftovers: drag-and-drop seat editor, auto checkout redirect
- Phase 15/17 leftovers: POS print UI, PDF email attachment

## Constraints

Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe, no payment collection.

Waiting for approval before Phase 19.
