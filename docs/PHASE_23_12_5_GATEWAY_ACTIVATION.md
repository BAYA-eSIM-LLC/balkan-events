# Phase 23.12.5 – Gateway activation

**Date:** 2026-11-23  
**Status:** Gateway Nginx and TLS are up. Production API was not modified.

---

## Done

- DNS `admin.balkanevents.org` → 2.29.199.6 (already created by owner)
- WireGuard handshake confirmed
- Let's Encrypt cert issued on the gateway only
- nginx.conf server_name and cert paths updated
- `nginx -t` passed
- Docker Compose profile `admin` started
- Public `https://admin.balkanevents.org/health` returns 200

## Changed on gateway only

- `/opt/balkan-gateway/nginx/nginx.conf`
- `/opt/balkan-gateway/nginx/docker-compose.yml`
- `/etc/letsencrypt/live/admin.balkanevents.org/`
- Container `balkan-admin-gateway-nginx-1`

Backups:

- `nginx.conf.backup-20261123-174233`
- `docker-compose.yml.backup-20261123-174233`

## Tests

| Test | Status | Evidence |
|---|---|---|
| DNS A record | PASS | 2.29.199.6 |
| WireGuard handshake | PASS | recent handshake |
| Tunnel /health | PASS | `{"status":"healthy"}` |
| nginx -t | PASS | syntax ok |
| TLS cert | PASS | CN=admin.balkanevents.org, Let's Encrypt, expires 2027-02-21 |
| Public /health | PASS | HTTPS 200 |
| /admin/ and /auth/ proxy | PASS | request reaches API |
| Live /admin/dashboard | BLOCKED | production OpenAPI has only `/` and `/health` |
| Live JWT / MFA / RBAC | BLOCKED | admin routes are not deployed on production |
| GET /admin/me USER isolation | BLOCKED live | code requires only `get_current_user`; route not on production |
| Allow-list | not applied | by rule |
| Production modified | no | |

## Security notes

- `/admin/me` in the repo returns the caller's own profile to any logged-in user. It does not return other users. A USER still should not be on an admin path. Fix requires an API change and is not applied.
- Production currently exposes no `/admin` routes. Gateway correctly proxies; the API returns 404.
- Public port 8000 was not restricted.
- Private keys were not printed.

## Risks

- Admin functions cannot be used until the Super Admin API is deployed on production. That needs a separate approval.
- Certificate renews via certbot timer. Nginx must be reloaded after renewal; not automated yet.

## Constraints honored

Production server, database, containers, firewall, DNS records, Stripe, and MFA settings were not changed.
