# Phase 23.19 – Functional status

**Date:** 2026-11-23  
**Branch:** super-admin-dashboard  
**Constraint:** no root key on production. No DB changes. No migrations. No deploy.

## Done on the branch

- Super Admin routes, MFA, recovery codes, RBAC, settings, orders, tickets, scanner, seat map, POS, analytics, sponsors, permissions.
- Migrations 001–026.
- CI green: run 45249413683.
- Gateway Nginx up. `https://admin.balkanevents.org/health` returns 200 through WireGuard.

## Production reality (read-only via tunnel)

- `http://10.10.0.1:8000/health` returns healthy.
- OpenAPI has only `/` and `/health`.
- Gateway `/admin/me` returns 404 because production is still the stub image.
- Schema, Alembic revision and image digest cannot be read without a production shell.

## Concrete obstacle

Production is not running the branch. Aligning it requires a deploy of the tested image and migrations. That needs a separate confirmation.

## Shortest safe next step

Confirm deploy of the branch image to production, after a backup.  
Until then, no production change.

## Not done

- Production schema audit
- Production deploy
- Live MFA/RBAC on the production API
