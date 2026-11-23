# Phase 23.10 – Isolated Nginx live validation

**Date:** 2026-11-23  
**Host:** 2.29.199.6  
**Status:** Complete. Test stack removed. Gateway Nginx not started. Production not contacted.

---

## Setup

- Temporary stack in `/opt/balkan-nginx-test`
- nginx:alpine bound to `127.0.0.1:18080` only
- Mock upstream on the same Docker network
- No TLS, no DNS, no WireGuard peer
- Gateway directory `/opt/balkan-gateway/` not modified

---

## Tests

| Test | Status | Evidence |
|---|---|---|
| Authorization forwarded on /admin/ | PASS | `authorization: Bearer test-token-not-a-secret` |
| Authorization forwarded on /auth/ | PASS | same |
| Host forwarded | PASS | `host: admin.test` |
| X-Real-IP forwarded | PASS | `172.18.0.1` |
| X-Forwarded-For forwarded | PASS | `172.18.0.1` |
| X-Forwarded-Proto forwarded | PASS | `http` |
| /health proxied | PASS | path `/health` |
| /health has no secrets | PASS | authorization null, no token fields |
| Disallowed path returns 404 | PASS | `/events` → 404 |
| nginx -t | PASS | syntax ok |
| Bound to localhost only | PASS | `127.0.0.1:18080` |
| Production Gateway Nginx | BLOCKED | not started, by rule |

**Passed:** 11  
**Failed:** 0  
**Blocked:** 1 (production gateway Nginx, intentionally)

---

## Removed

- `balkan-nginx-test-nginx-1`
- `balkan-nginx-test-mock-1`
- Network `balkan-nginx-test`

## Gateway unchanged

- `wg0` active, no peer
- System Nginx inactive
- `/opt/balkan-gateway/` intact
- UFW not modified

## Constraints honored

No production contact, no WireGuard change, no gateway Nginx start, no DNS, no TLS, no merge to main.
