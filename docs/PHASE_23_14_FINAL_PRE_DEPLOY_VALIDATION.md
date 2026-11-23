# Phase 23.14 – Final pre-deploy validation

**Date:** 2026-11-23  
**Status:** Audit and one code fix. No production access. No deploy.

---

## A. Database

### How to read the production revision (not run)

On the production host, read-only:

```
docker exec <api-or-db-container> alembic current
# or
psql "$DATABASE_URL" -c "SELECT version_num FROM alembic_version;"
```

Do not run `upgrade`. Do not assume the revision is 026.

### Compatibility

Chain is linear: `001` → `026_totp_secret_len`.

| Range | Effect on existing data |
|---|---|
| 001–009 | Creates core tables. Safe on an empty DB. On a populated DB, only if those tables are missing. |
| 010–023 | Adds CMS, orders, scanner, seats, POS, guests, sponsors, permissions, discovery. Additive. |
| 024–025 | Adds MFA columns and tables. Nullable. Existing users stay without MFA. |
| 026 | Widens `totp_secret` from 64 to 255. No data loss. Required before MFA enroll. |

**Production schema version: BLOCKED.** No production database access was used.

---

## B. Security

### Fix applied

`GET /admin/me` now requires `ADMIN` or `SUPERADMIN`. A USER or ORGANIZER receives 403.

### Remaining findings

| Endpoint | Guard | Note |
|---|---|---|
| `/admin/me` | ADMIN, SUPERADMIN | fixed in this phase |
| Admin dashboard, users, orders, settings | ADMIN, SUPERADMIN | already guarded |
| Venue and performer create/update/deactivate | any logged-in user | still open. Not changed. |
| Own password and own support ticket | logged-in user | correct |

### MFA / JWT / Redis

Isolated results from Phase 23.9 still stand: TOTP, refresh rejection, recovery one-time, 5 attempts, Redis shared limit.  
Not re-run here. No Docker in this environment. Gateway was not used.

---

## C. Staging

| Test | Status |
|---|---|
| Isolated Postgres 16 to 026 (23.9) | PASS, previously recorded |
| MFA suite (23.9) | PASS, previously recorded |
| Fresh staging re-run this phase | BLOCKED — no Docker, gateway left untouched |
| Deploy simulation on production | not done |
| Rollback simulation on production | not done |

---

## D. Future deploy order (needs approval)

1. Read `alembic_version` on production. Stop if unexpected.
2. Snapshot the database and tag the current API image.
3. Restore the snapshot on a copy. Run `alembic upgrade head` there.
4. Start the branch image against the copy. Confirm `/health` and `/openapi.json` path count.
5. Confirm USER gets 403 on `/admin/me` and `/admin/dashboard`.
6. Only then switch production traffic.
7. Abort and restore the snapshot if health is not 200 or path count stays at 2.

### Stop criteria

- `alembic upgrade` errors
- `/health` not 200
- OpenAPI still only `/` and `/health`
- Existing login broken on the copy

### Rollback

Restore the previous image. Restore the database snapshot if a migration was applied. Do not `downgrade` on production. Gateway needs no change.

---

## Tests this phase

| Item | Status |
|---|---|
| `/admin/me` restricted in code | PASS |
| Migration chain reviewed | PASS |
| Production revision read | BLOCKED |
| Live role test on production | BLOCKED |
| Staging re-run | BLOCKED |
| Deploy | not done |

---

## Risks

1. Production revision is unknown.
2. Catalog venue/performer writes are still open to any logged-in user.
3. MFA must not be forced until recovery codes are stored offline.
4. Replacing the stub changes every client of port 8000.

---

## Constraints honored

No production deploy. No production database change. No production migration. No production Docker, firewall, or port change. Gateway not modified. No merge to main.
