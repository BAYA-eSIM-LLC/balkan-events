# Phase 23.17 – Image build and rollback validation

**Date:** 2026-11-23  
**Status:** Complete on an isolated runner. Production not accessed.

---

## Run

https://github.com/BAYA-eSIM-LLC/balkan-events/actions/runs/45234011687

All steps passed.

---

## Image

| Tag | Digest |
|---|---|
| `balkan-api:candidate` | `sha256:5150f6d3f92a33dfd00d20e9bcddcfd1d290fb67bf880d665c2715b6086771ab` |
| `balkan-api:previous` (stub) | `sha256:5c875485e1e11efb9b0658bd3e7f6c82a9af7d025434f6430d8329ed9fa23910` |

Image contains the app: `routers 47`.  
Secret scan: `NO_LIVE_SECRETS`.

---

## Tests

| Step | Status |
|---|---|
| Build `Dockerfile.prod` | PASS |
| Modules present | PASS |
| Alembic on Postgres 16 | PASS |
| `/health` | PASS |
| Unauthenticated `/admin/dashboard` | PASS, 401/403 |
| USER `/admin/me` | PASS, 403 |
| Rollback to stub `/health` | PASS |
| Downgrade required | no |
| Production access | not done |

---

## Future deploy commands (not run)

```
cd services/api
docker build -f Dockerfile.prod -t balkan-api:candidate .
# against a restored copy, not production
docker run --rm -e DATABASE_URL=... balkan-api:candidate alembic upgrade head
docker run -d --name api -e DATABASE_URL=... -p 8000:8000 balkan-api:candidate
curl -fsS http://127.0.0.1:8000/health
```

Rollback:

```
docker rm -f api
docker run -d --name api balkan-api:previous
curl -fsS http://127.0.0.1:8000/health
```

No `alembic downgrade`. Restore the database snapshot only if a migration must be undone.

---

## Risks

1. Production schema revision is still unknown.
2. The stub used as “previous” is a stand-in, not the real production image.
3. MFA encryption key must be set before enroll. It was generated at runtime on the runner and not stored.
4. Image was not pushed to a registry.

---

## Constraints honored

No production access. No production database. No deploy. Gateway, DNS, TLS, and firewall not modified. No merge to main.
