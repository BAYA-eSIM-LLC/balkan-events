# Phase 19.1 – RBAC & Event-Level Security Completion

**Branch:** super-admin-dashboard  
**Commit:** 00a9dde  
**Date:** 2026-11-23

## CI (PostgreSQL 16)

- **Run:** [45143424707](https://github.com/BAYA-eSIM-LLC/balkan-events/actions/runs/45143424707)
- **Tests:** **104 passed, 0 failed, 0 skipped**
- Migrations 001–021: passed

## Enforcement added

### Helper
`check_event_cap(db, event_id, user, cap)` in `app/services/permissions.py`

- Superadmin/admin bypass
- Requires organization membership
- If an `EventPermission` row exists, the matching flag must be true
- Otherwise falls back to org role capability

### Wired endpoints
- `POST /scanner/validate` — requires `scan`
- `POST /guest-lists` — requires `manage_tickets` on the event
- `GET /analytics/organizer/{id}` and CSV export — requires `view_sales` or `view_finance`

### Invitation resend
- `POST /orgs/invitations/{id}/resend`
- Revokes previous invitation
- Issues new hashed token and new 7-day expiry
- Queues email and writes audit log

## Permission matrix (org role → finance endpoint)

| Role | `/orgs/{id}/finance` |
|------|----------------------|
| OWNER | 200 |
| ADMIN | 200 |
| FINANCE_MANAGER | 200 |
| FINANCE_VIEWER | 200 |
| EVENT_MANAGER | 403 |
| TICKET_MANAGER | 403 |
| SCANNER | 403 |
| POS_SELLER | 403 |
| VIEWER | 403 |

## Tests
- Parametrized finance matrix for 9 roles
- Event-level scan deny when `can_scan=False`
- Resend invitation returns new token and new id
- Existing double-scan regression updated to grant scanner membership (security model now enforced)

## Endpoint audit summary

| Area | Org check | Event check | Notes |
|------|-----------|-------------|-------|
| Scanner validate | yes | yes (`scan`) | |
| Guest lists | yes | yes (`manage_tickets`) | |
| Organizer analytics | yes | role cap | |
| Finance | yes | role cap | |
| POS sale | staff assignment | — | sales point staff |
| Seat maps | org membership | — | |
| Sponsors | org membership | — | |
| Orders / tickets | owner or admin | — | buyer access |
| Admin endpoints | role | — | superadmin/admin only |

## Not fully wired
- Event-level check on every seat map, POS, and sponsor endpoint (org isolation present; event-level flags not yet applied to all)
- POS sale still uses sales-point staff assignment rather than event `can_pos`

## Constraints

Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe.

Waiting for approval before Phase 20.
