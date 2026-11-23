# Phase 19.3 – Final POS & Analytics Security Audit

**Branch:** super-admin-dashboard  
**Commit:** e275b05  
**Date:** 2026-11-23

## CI (PostgreSQL 16)

- **Run:** [45146069074](https://github.com/BAYA-eSIM-LLC/balkan-events/actions/runs/45146069074)
- **Tests:** **112 passed, 0 failed, 0 skipped**
- Migrations 001–021: passed

## POS ticket-type security

`POST /pos/sale` with `ticket_type_id`:

1. Loads `TicketType` from the database.
2. Resolves `event_id` from the ticket type (does not trust a client-supplied event id).
3. Requires SalesPointStaff assignment.
4. Requires `can_pos` for that event (event-level flag or org role).
5. Returns 403 if the seller is not permitted for that event.

### Tests
- POS_SELLER with `can_pos=False` → 403
- POS_SELLER with `can_pos=True` → 200
- Ticket type from another event with `can_pos=False` → 403

## Analytics & finance audit

| Endpoint | Access | Scope | Data returned |
|----------|--------|-------|---------------|
| `GET /admin/analytics/overview` | ADMIN/SUPERADMIN | platform | gross, orders, web/POS, tickets |
| `GET /admin/analytics/by-event` | ADMIN/SUPERADMIN | platform | top events |
| `GET /admin/analytics/by-organizer` | ADMIN/SUPERADMIN | platform | top organizers |
| `GET /analytics/organizer/{id}` | org member with view_sales or view_finance | org, filtered by event permissions if present | revenue, orders, tickets for allowed events only |
| `GET /analytics/organizer/{id}/export.csv` | same | same | CSV of allowed data |
| `GET /orgs/{id}/finance` | view_finance | org | finance note |
| `GET /admin/sponsors/analytics` | ADMIN/SUPERADMIN | platform | agreed value, collected=0 |
| Orders/refunds | owner or admin | own or all | no cross-user |
| POS reports | staff or admin | sales point | register variance |

### Event-level analytics filter
If a user has `EventPermission` rows for the organization, organizer analytics includes only events where `can_view_sales` or `can_view_finance` is true. Aggregates do not include other events.

## Security matrix (POS)

| Actor | Seat sale | Ticket-type sale | Other-event ticket type |
|-------|-----------|------------------|-------------------------|
| POS_SELLER can_pos=True | allowed | 200 | 403 |
| POS_SELLER can_pos=False | denied | 403 | 403 |
| Non-member | 403 | 403 | 403 |

## Remaining gaps
- Buyer reserve/checkout remains open to the reservation owner (intentional)
- Admin analytics is platform-wide by design (superadmin only)
- Not every historical order endpoint has event-level finance flags; owner/admin access is org-scoped

## Constraints

Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe.

Waiting for approval before Phase 20.
