# Phase 23.5 – Super Admin API Integration Audit

**Date:** 2026-11-23  
**Status:** Audit only. No deploy. No production contact.

---

## 1. Authentication

- `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/register`
- JWT access token in `Authorization: Bearer`
- Refresh rotates and revokes the old token
- Admin with `mfa_enabled` must use `/auth/mfa/confirm`
- Refresh is rejected for MFA-enabled admins

## 2. MFA and recovery

- Setup encrypts TOTP with `MFA_ENCRYPTION_KEY`
- 10 recovery codes, stored as SHA-256, one-time
- Pending tokens in `mfa_pending`, 5 min, 5 attempts
- Not enforced until integration tests pass on Postgres 16

## 3. Super Admin endpoints

All under `/admin` unless noted. Role checks via `require_admin_role`.

| Endpoint | Guard |
|---|---|
| GET /admin/dashboard | ADMIN, SUPERADMIN |
| GET /admin/users | ADMIN, SUPERADMIN |
| PATCH /admin/users/{id}/role | SUPERADMIN |
| GET /admin/orders, /admin/orders/{id} | ADMIN, SUPERADMIN |
| GET /admin/tickets | ADMIN, SUPERADMIN |
| GET/PATCH /admin/settings | ADMIN, SUPERADMIN |
| GET /admin/audit | ADMIN, SUPERADMIN |
| GET /admin/finance/overview | finance roles |
| GET /admin/me | any logged-in user (own profile only) |

## 4. Nginx

- Proxies `/admin/` and `/auth/` to `10.10.0.1:8000`
- Sets Host, X-Real-IP, X-Forwarded-For, X-Forwarded-Proto
- Authorization is passed by nginx default; not explicit
- `/health` is not proxied (private-link test should use a proxied path or add `/health`)
- Profile `admin` prevents accidental start
- Not started

## 5. JWT and headers

Client sends `Authorization`. Nginx forwards it unless `proxy_hide_header` or `underscores_in_headers` interferes. Neither is set. Explicit `proxy_set_header Authorization $http_authorization;` is recommended before go-live.

## 6. Audit logging

`log_audit` writes to `AuditLog` for role changes, activation, password changes, org approve/reject, event status. GET `/admin/audit` lists them. Not every read is logged. Writes on sensitive admin actions are covered.

## 7. WireGuard

- Gateway at 10.10.0.2, no peer
- Upstream in nginx points at 10.10.0.1:8000
- Will fail until peer is approved and the API listens on the tunnel
- Do not apply `/admin` allow-list on the API host until `test-private-link.sh` passes

## 8. Gaps

1. Authorization header not explicit in nginx
2. `/health` not proxied
3. MFA not enforced
4. Full Postgres integration suite not run (no Docker in the previous audit environment)
5. Rate limiter needs `REDIS_URL` to be shared across workers
6. IP allow-list commented out
7. TLS certificate paths are placeholders

## 9. Tests

- `deploy/super-admin-gateway/validate-config.sh` — static check, passed
- No live HTTP calls to production
- No containers started

## 10. Recommendations

- Add explicit Authorization header before first start
- Add `/health` location for the private-link test
- Run `mfa-integration-test.sh` on a Docker host before enforcing MFA
- Approve WireGuard peer and DNS together, then certbot
- Keep gateway free of a database

## Constraints honored

No Nginx start, no Super Admin start, no peer, no DNS, no change to 2.29.195.181, no database change, no Stripe, no deploy.
