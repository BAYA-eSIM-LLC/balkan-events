# Phase 19.2 – Complete Event-Level Enforcement

**Branch:** super-admin-dashboard  
**Commit:** fe0a808  
**Date:** 2026-11-23

## CI (PostgreSQL 16)

- **Run:** [45144501165](https://github.com/BAYA-eSIM-LLC/balkan-events/actions/runs/45144501165)
- **Tests:** **109 passed, 0 failed, 0 skipped**
- Migrations 001–021: passed (no new migration)

## Endpoints reviewed and protected

### Seat Maps
- `POST /seat-maps` — org membership + `manage_events` on the event
- `POST /seat-maps/{id}/sectors` — org + `manage_events`
- `POST /seat-maps/sectors/{id}/rows` — org + `manage_events`
- `POST /seat-maps/reserve` — buyer action (own reservation); staff mutation covered above
- `POST /seat-maps/checkout` — buyer with active reservation
- `GET /seat-maps/event/{id}` — public
- Admin list/detail — admin role

### POS
- `POST /pos/sale` — SalesPointStaff check retained
- When seats are sold, resolves event and requires `can_pos` (event-level or org role)
- Changing event via seat IDs of another org fails the event cap check

### Sponsors
- `POST /sponsors` — org membership
- `POST /sponsors/placements` — sponsor org access + `manage_events` when `event_id` is set
- `GET /public/sponsors` — only active, within date window

## Permission outcomes tested

| Actor | Seat map create | Sponsor placement other org | Notes |
|-------|-----------------|-----------------------------|-------|
| OWNER | 200 | 403 | |
| VIEWER | 403 | — | |
| Non-member | 403 | — | |
| POS_SELLER with can_pos=False | — | — | sale returns 400/403/409 |
| Other org owner | — | 403 | |

## Tests added
- Viewer cannot create seat map
- Owner can create seat map
- POS seller with explicit can_pos=False cannot complete seat sale
- Sponsor placement for another org's sponsor returns 403
- Non-member cannot create seat map

## Remaining gaps
- Buyer reservation/checkout is intentionally open to the ticket holder (not a staff capability)
- POS ticket-type (non-seat) sale does not yet resolve an event for can_pos
- Not every existing analytics/finance endpoint has event-level flags applied beyond org role

## Constraints

Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe.

Waiting for approval before Phase 20.
