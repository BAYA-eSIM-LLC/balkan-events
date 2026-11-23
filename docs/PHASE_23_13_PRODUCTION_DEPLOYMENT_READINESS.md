# Phase 23.13 – Production API deployment readiness

**Date:** 2026-11-23  
**Status:** Audit only. No production deploy. No database change.

---

## 1. Why production OpenAPI has only `/` and `/health`

Read-only check via the tunnel:

```
GET http://10.10.0.1:8000/openapi.json
```

Response paths: `/`, `/health`. Title `Balkan Events` 0.1.0.

The process is a stub. It is not the `super-admin-dashboard` application, which registers 41 routers in `app/main.py`.

---

## 2. Comparison

| Item | Production | Branch `super-admin-dashboard` |
|---|---|---|
| OpenAPI paths | 2 | full app |
| `/auth` | absent | login, refresh, logout, MFA |
| `/admin` | absent | dashboard, users, orders, settings, audit |
| Migrations | unknown (no DB access) | 001–026, linear chain |
| Gateway | proxies correctly | ready |

---

## 3. Routes that a deploy would add

Auth: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/mfa/setup`, `/auth/mfa/enable`, `/auth/mfa/confirm`, `/auth/mfa/recovery/regenerate`.

Admin (all under `/admin`): `/me`, `/dashboard`, `/users`, role and active patches, password endpoints, organizations approve/reject, events moderation, orders, tickets, settings, audit, finance, support, notes.

Plus organizer, scanner, seat map, POS, analytics, guest lists, sponsors, search, and CMS routers already in `main.py`.

---

## 4. Auth and security in code

- JWT access and rotating refresh
- MFA for ADMIN and SUPERADMIN when `mfa_enabled`
- Recovery codes hashed, one-time
- Rate limiter fixed for same-second Redis hits
- Redis is optional; in-memory fallback is per process
- `/admin/me` uses `get_current_user` only. It returns the caller's own id, email, and role. A USER can open it. It does not list other users. Other admin routes use `require_admin_role`.

---

## 5. Migrations

Linear chain `001` → `026_totp_secret_len`.  
`026` widens `totp_secret` to 255 for Fernet ciphertext. Required before MFA enroll.

---

## 6. Database compatibility

**BLOCKED.** Production schema version was not read. No production query was run.  
Isolated Postgres 16 reached head `026` in Phase 23.9.

---

## 7–8. Role isolation

Isolated tests in 23.9: USER blocked from `/admin/dashboard` — PASS.  
Live production role test: **BLOCKED** — admin routes are not deployed.  
`/admin/me` still needs an admin-role check before deploy.

---

## 9. Impact

Deploying this branch replaces the stub. Existing public `/` and `/health` remain.  
New tables and columns come from 001–026.  
Existing users, events, and tickets are only at risk if the production database is migrated. That is not done in this phase.  
Auth behavior changes only after the new process is running.

---

## 10. Deploy plan (not executed)

1. Approve a maintenance window.
2. Snapshot the production database and the current API image.
3. Record `alembic current` on a copy, not on production, if a dump is provided.
4. Deploy the branch image beside the stub. Do not switch traffic yet.
5. Run migrations on a restored copy first.
6. Switch the API process only after the copy reaches `026` and health is 200.
7. Confirm gateway `/health` still returns 200.
8. Do not enable the public `/admin` allow-list in the same step.

## Rollback

1. Point the API process back at the previous image.
2. Do not run `alembic downgrade` on production unless the snapshot restore is the chosen path.
3. Restore the database snapshot if a migration was applied.
4. Gateway needs no change. It already proxies to `10.10.0.1:8000`.

## Commands for a future approved deploy

```
# on a copy, not production
alembic upgrade head
curl -fsS http://127.0.0.1:8000/health
curl -fsS http://127.0.0.1:8000/openapi.json | python -c "import sys,json; print(len(json.load(sys.stdin)['paths']))"
```

---

## Tests this phase

| Test | Status |
|---|---|
| Production OpenAPI read | PASS — only `/` and `/health` |
| Repo route inventory | PASS |
| Migration chain 001–026 | PASS |
| Isolated MFA suite (23.9) | PASS, previously recorded |
| Production schema version | BLOCKED — no DB access |
| Live role matrix on production | BLOCKED — routes not deployed |
| Deploy | not done |

---

## Risks

1. Production DB revision is unknown. A blind `upgrade head` could fail or rewrite data.
2. `/admin/me` is open to any logged-in user.
3. MFA must not be forced until a SUPERADMIN recovery set is stored offline.
4. Replacing the stub is a behavior change for every current client of port 8000.
5. Redis is not confirmed on production. Rate limit would be per process until `REDIS_URL` is set.

---

## Constraints honored

No merge to main. No production deploy. No production migration. No Docker, firewall, or port change on production. Gateway, DNS, and TLS not modified. No secrets printed.
