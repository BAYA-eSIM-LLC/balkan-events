# Phase 23.6 – Super Admin Security Hardening & Integration Fixes

**Date:** 2026-11-23  
**Branch:** super-admin-dashboard  
**Status:** Config and tests prepared. Gateway not started. Production not touched.

---

## Changes

### Nginx
- Explicit `proxy_set_header Authorization $http_authorization`
- `/health` proxied to the API `/health`
- Host, X-Real-IP, X-Forwarded-For, X-Forwarded-Proto set on all proxied locations
- `/admin/` and `/auth/` only; everything else returns 404
- IP allow-list prepared as `admin-allowlist.conf.example`, include left commented

### MFA
- Recovery procedure documented in `docs/MFA_ADMIN_RECOVERY.md`
- Flow tests in `services/api/tests/test_mfa_flow.py`
- MFA is not enforced on production

### Redis
- `REDIS_URL` added to `.env.example`
- Rate limiter unit test passed (in-memory path)

### TLS
- Config expects real Let's Encrypt paths
- No self-signed certificate installed
- Certbot only after DNS approval

---

## Tests

| Test | Result |
|---|---|
| `validate-config.sh` | STATIC_VALIDATION_OK |
| `test_rate_limit.py` | 1 passed |
| MFA login integration on Postgres 16 | not run — no local Postgres |
| Unauthorized `/admin` | covered in `test_mfa_flow.py`, needs DB to execute |
| Health has no secrets | covered in `test_mfa_flow.py`, needs DB to execute |

---

## Remaining gaps

1. Full MFA integration suite needs a Postgres 16 host
2. Redis multi-worker limit not load-tested
3. Allow-list not activated (by design)
4. TLS certificate not issued (no DNS)
5. WireGuard peer not configured
6. Nginx not started on the gateway

---

## Future integration test order

1. Run `deploy/gateway/mfa-integration-test.sh` on a Docker host
2. Confirm health returns only `{"status":"healthy"}`
3. Approve WireGuard peer
4. Run `test-private-link.sh`
5. Uncomment allow-list only after that
6. Issue real certificate after DNS approval
7. Then `docker compose --profile admin up -d`

---

## Constraints honored

No Nginx start, no Super Admin start, no peer, no DNS, no change to 2.29.195.181, no production database change, no Stripe, no secrets disclosed, no deploy.
