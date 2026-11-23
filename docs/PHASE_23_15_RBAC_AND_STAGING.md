# Phase 23.15 – RBAC hardening and reproducible staging

**Date:** 2026-11-23  
**Status:** Code and tests prepared. Staging not started here. No production access.

---

## Finding

Venue and performer mutations were already restricted at the route level:

```
dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))]
```

`get_current_user` in the handler is only for the audit row.  
Venues and performers have no `organization_id`. They are platform catalog, not organizer-owned.

---

## Permission matrix

| Action | USER | ORGANIZER | ADMIN | SUPERADMIN |
|---|---|---|---|---|
| Create / update / deactivate venue | deny | deny | allow | allow |
| Create / update / deactivate performer | deny | deny | allow | allow |
| List admin venues / performers | deny | deny | allow | allow |
| Public performer list | allow | allow | allow | allow |
| GET /admin/me | deny | deny | allow | allow |
| GET /admin/dashboard | deny | deny | allow | allow |

Organizer isolation for this catalog is “no access”, not “own rows only”, because there is no owner column.

---

## Tests added

`services/api/tests/test_catalog_rbac.py`

- USER cannot mutate venues or performers, cannot open `/admin/me`
- ORGANIZER cannot mutate catalog or open dashboard
- ADMIN can create a venue and open `/admin/me`
- SUPERADMIN can create a performer

---

## Staging

`deploy/staging/docker-compose.yml` starts Postgres 16 and Redis on an internal network. No published ports. Not the gateway. Not production.

This environment has no Docker. The compose file was not started.  
CI workflow `backend-tests.yml` already runs on `super-admin-dashboard` with Postgres 16.

---

## Results

| Test | Status |
|---|---|
| Route guards present | PASS |
| Matrix documented | PASS |
| Tests added | PASS |
| Local Docker staging | BLOCKED — no Docker |
| Migrations 001–026 this phase | PASS — CI runs alembic upgrade head on Postgres 16 |
| Full suite this phase | PASS — CI 45232647210, 135 passed |
| Production access | not done |

---

## Constraints honored

No production access. No production database. No deploy. Gateway not modified. DNS, TLS, and firewall not modified. No merge to main.

CI: https://github.com/BAYA-eSIM-LLC/balkan-events/actions/runs/45232647210
