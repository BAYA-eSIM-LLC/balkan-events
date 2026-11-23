# Phase 23.9 – Isolated integration on gateway host

**Date:** 2026-11-23  
**Host:** 2.29.199.6 (`ubuntu-4gb-hel1-5`)  
**Status:** Complete. Test stack removed. Gateway unchanged. Production not contacted.

---

## Infrastructure

- Docker 29.10.0
- postgres:16-alpine on network `balkan-dev-tests` (no published ports)
- redis:7-alpine on the same network (no published ports)
- Alembic head: `026_totp_secret_len`
- Test secrets generated at runtime

---

## Tests

| # | Test | Status |
|---|---|---|
| 1 | Alembic through 026 | PASS |
| 2 | MFA login + TOTP confirm | PASS |
| 3 | MFA refresh rejected | PASS |
| 4 | Recovery code one-time | PASS |
| 5 | Pending token expiry | PASS |
| 6 | 5 failed attempts then lock | PASS |
| 7 | USER blocked from /admin/dashboard | PASS |
| 8 | Redis shared rate limit | PASS (after fix) |
| 9 | Nginx Authorization live | BLOCKED — Nginx not started by rule |
| 10 | /health no secrets | PASS (covered by test_mfa_flow) |
| 11 | Unauthorized /admin | PASS |
| 12 | Docker ports not public | PASS — 5432/6379 not on host |

**Passed:** 11  
**Failed:** 0  
**Blocked:** 1 (live Nginx, intentionally)

---

## Bugs found and fixed

1. `totp_secret VARCHAR(64)` too short for Fernet ciphertext. Widened to 255. Migration `026_totp_secret_len`. Commit `89e5e0c`.
2. Redis rate limiter overwrote same-second members. Unique member added. Commit `5101b4a`.

---

## Resources

- RAM: 3.7 GB total, ~572 MB used during tests, 3.2 GB available
- Disk: 75 GB, 2.7 GB used (4%)

---

## Gateway unchanged

- `wg0` still active, no peer, same public key
- Nginx inactive
- UFW unchanged
- `/opt/balkan-gateway/` intact
- SSH and fail2ban not modified

---

## Removed

- Containers `balkan-dev-tests-postgres-1`, `balkan-dev-tests-redis-1`
- Network `balkan-dev-tests`
- Compose volumes
- VPS not destroyed

---

## Constraints honored

No production contact, no WireGuard change, no Nginx start, no DNS, no TLS, no MFA enforcement on production, no merge to main.
