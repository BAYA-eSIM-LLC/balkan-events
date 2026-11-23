# Phase 23.16 – Deployment simulation and read-only audit plan

**Date:** 2026-11-23  
**Status:** Simulation documented. Production not accessed.

---

## 1. Staging already run

GitHub Actions on `super-admin-dashboard`:

- Run: https://github.com/BAYA-eSIM-LLC/balkan-events/actions/runs/45232647210
- Postgres 16 service, fresh database
- `alembic upgrade head` (001–026)
- **135 passed, 0 failed**

That is the isolated staging run. No production data was used.

---

## 2. Business functions covered by that run

| Area | Status |
|---|---|
| Users / auth / MFA | PASS in CI |
| Organizers and RBAC | PASS |
| Events | PASS |
| Orders and tickets | PASS |
| QR / inventory concurrency | PASS |
| Catalog RBAC | PASS |

---

## 3. Image swap simulation (not executed on production)

Build and tag on a runner, not on 2.29.195.181:

```
cd services/api
docker build -f Dockerfile.prod -t balkan-api:candidate .
docker tag balkan-api:candidate balkan-api:previous   # only if a previous image exists
# start candidate against a copy of the database
# curl -fsS http://127.0.0.1:8000/health
# curl -fsS http://127.0.0.1:8000/openapi.json
```

Rollback simulation:

```
# stop candidate
# start the previous image tag
# curl -fsS http://127.0.0.1:8000/health
```

This was not run here. This environment has no Docker. Production was not contacted.

---

## 4. Rollback does not need a database downgrade

Migrations 001–026 are additive:

- new tables
- nullable MFA columns
- `totp_secret` widened to 255

The current production process is a stub with `/` and `/health`. It does not read the new columns.  
Rolling the process back to that image after a forward migration does not require `alembic downgrade`.  
Rolling the new image onto a database that has not reached `026` will fail. Migrate the copy first.

---

## 5. Read-only SQL (do not run until approved)

```sql
SELECT version_num FROM alembic_version;
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
SELECT column_name, character_maximum_length
  FROM information_schema.columns
 WHERE table_name = 'users' AND column_name = 'totp_secret';
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM events;
SELECT COUNT(*) FROM orders;
```

If `alembic_version` is missing, the database is not managed by this app. Stop.

---

## 6. Backup and integrity

```
pg_dump -Fc -f balkan-$(date +%Y%m%d-%H%M).dump "$DATABASE_URL"
pg_restore -l balkan-*.dump | head
# restore into an empty database and run: SELECT version_num FROM alembic_version;
```

Keep the dump off the VPS. Do not restore over production.

---

## 7. Abort criteria

Stop and roll back the process if any of these happen:

- `alembic upgrade` errors on the copy
- `/health` is not 200
- OpenAPI still has only `/` and `/health` after the new image starts
- Existing login on the copy fails
- `alembic_version` on production is missing or unexpected

---

## 8. Results

| Item | Status |
|---|---|
| Fresh DB migrations 001–026 | PASS (CI) |
| Business suite | PASS, 135/135 |
| Image build simulation | BLOCKED — no Docker here |
| Rollback simulation | BLOCKED — no image on this host |
| Production read-only SQL | prepared, not run |
| Production access | not done |

---

## 9. Needs separate approval

- Reading `alembic_version` on production
- Taking a production `pg_dump`
- Building or pulling an image on the production host
- Switching the API process
- Any firewall, DNS, or gateway change

---

## Constraints honored

No production deploy. No production database change. No production migration. Gateway, Nginx, DNS, and firewall not modified. No merge to main.
