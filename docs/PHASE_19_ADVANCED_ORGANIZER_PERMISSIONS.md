# Phase 19 – Advanced Organizer & Permissions PRO

**Branch:** super-admin-dashboard  
**Commit:** 8e33de4  
**Date:** 2026-11-23

## CI (PostgreSQL 16)

- **Run:** [45142367270](https://github.com/BAYA-eSIM-LLC/balkan-events/actions/runs/45142367270)
- **Tests:** **93 passed, 0 failed, 0 skipped**
- Migrations 001–021: passed

## Implemented

### Models
- `EventPermission` — per-event flags (manage, view_sales, view_finance, manage_tickets, scan, pos)
- `OrgInvitation` — email, role, hashed token, expiry, accepted/revoked
- Extended `OrgRole`: FINANCE_MANAGER, TICKET_MANAGER, POS_SELLER, VIEWER

### Migration
- `021_permissions`

### Permission matrix
| Role | Capabilities |
|------|--------------|
| OWNER / ADMIN | all |
| EVENT_MANAGER | manage_events, view_sales, manage_tickets, scan, view |
| FINANCE_MANAGER | view_sales, view_finance, export_finance, view |
| FINANCE_VIEWER | view_sales, view_finance, view |
| TICKET_MANAGER | manage_tickets, view_sales, view |
| SCANNER | scan, view |
| POS_SELLER | pos, view |
| SALES_MANAGER | view_sales, pos, view |
| STAFF / VIEWER | view |

### API
- `GET /admin/organizations`, `GET /admin/organizations/{id}`, `POST /admin/organizations/{id}/suspend`
- `GET /orgs/{id}/members`
- `POST /orgs/{id}/invite` — returns token once, stores hash
- `POST /orgs/invite/accept`
- `POST /orgs/invitations/{id}/revoke`
- `PATCH /orgs/{id}/members/{mid}` — change role
- `DELETE /orgs/{id}/members/{mid}`
- `POST /orgs/{id}/events/{eid}/permissions`
- `GET /orgs/{id}/finance` — requires view_finance
- `GET /orgs/permissions/matrix`

### Frontend
- `/admin/organizations`, `/admin/organizations/[id]`
- `/organizer/team`, `/organizer/permissions`

### Tests
- Invite creates token
- VIEWER cannot access finance (403)
- Non-member cannot list members of other org (403)

## Not finished

- Resend invitation endpoint (revoke + new invite works)
- Event-level permission enforcement on every existing endpoint (model and set endpoint exist; full wiring into all routers is incremental)
- Live screenshots
- Phase 14 leftovers: drag-and-drop seat editor, auto checkout redirect

## Constraints

Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe.

Waiting for approval before Phase 20.
