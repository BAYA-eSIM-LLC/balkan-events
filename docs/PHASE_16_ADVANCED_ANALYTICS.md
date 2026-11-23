# Phase 16 – Advanced Analytics PRO

**Branch:** super-admin-dashboard  
**Commit:** e68b815  
**Date:** 2026-11-23

## CI (PostgreSQL 16)

- **Run:** [45140658160](https://github.com/BAYA-eSIM-LLC/balkan-events/actions/runs/45140658160)
- **Tests:** **85 passed, 0 failed, 0 skipped**
- Migrations 001–018: passed

## Implemented

### Admin analytics
- `GET /admin/analytics/overview?period=` — gross, orders, web/POS split, tickets, refunds/cancels
- `GET /admin/analytics/by-event` — top events by revenue
- `GET /admin/analytics/by-organizer` — top organizers

### Periods
today, yesterday, this_week, last_week, this_month, last_month, this_year, custom (date_from/date_to)

### Channels
- Web: paid orders whose reference does not start with `POS-`
- POS: paid orders with `POS-` reference
- Mobile: 0 (no mobile channel field yet)

### Organizer analytics
- `GET /analytics/organizer/{id}` — revenue, web/POS, orders, tickets, used tickets
- Org isolation via `get_org_member`
- `GET /analytics/organizer/{id}/export.csv`

### Frontend
- `/admin/analytics` — period selector, KPI cards, top events
- `/organizer/analytics` — load by organization

### Tests
- Admin overview returns real aggregate keys
- Non-member gets 403 on organizer analytics

## Not finished

- Interactive charts (currently KPI cards and lists)
- PDF and Excel export (CSV only)
- City/country breakdown
- Service fee / net calculation (no fee config yet)
- Live screenshots
- Phase 14 leftovers: drag-and-drop seat editor, auto checkout redirect
- Phase 15 leftover: PDF ticket and email from POS

## Constraints

Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe. No mock data.

Waiting for approval before Phase 17.
