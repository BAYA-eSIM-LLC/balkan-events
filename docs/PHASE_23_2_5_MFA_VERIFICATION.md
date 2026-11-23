# Phase 23.2.5 – MFA Integration & Release Verification

**Date:** 2026-11-23  
**Base:** 4145e9c  
**Status:** Partial. Full Postgres integration not run (no Docker in this environment).

---

## Tests

| Test | Result |
|---|---|
| Encrypt / decrypt roundtrip | passed |
| Recovery codes unique and hashed | passed |
| Missing encryption key raises | passed |
| Wrong encryption key fails decrypt | passed |
| GPG encrypt / decrypt roundtrip | passed |
| MFA key not in git | passed |
| Alembic 001–025 on Postgres 16 | **not run — Docker unavailable** |
| TOTP login integration | **not run** |
| Refresh bypass integration | **not run** |
| Recovery one-time use integration | **not run** |
| Pending expiry / 5 attempts integration | **not run** |
| Redis multi-worker rate limit | **not run — Redis not started** |

**Passed:** 5 unit/security checks  
**Failed:** 0  
**Skipped / blocked:** 6 (need Docker Postgres 16)

Script ready for a machine with Docker: `deploy/gateway/mfa-integration-test.sh`

---

## Rate limiting

In-process limiter does not share state across workers.  
Added `services/api/app/services/rate_limit.py`:

- Uses Redis sorted sets when `REDIS_URL` is set
- Falls back to in-process if Redis is absent or errors
- Auth login and MFA confirm now call this shared limiter

Multi-worker behavior is correct only when `REDIS_URL` points at a shared Redis.

---

## Security checks

| Check | Result |
|---|---|
| TOTP secret not logged | No `logger` call writes `totp_secret` |
| Recovery codes shown once | Returned only from setup and regenerate |
| Recovery stored as hash | SHA-256 in `mfa_recovery_codes` |
| Encryption key not in repo | Confirmed |
| Missing key | `RuntimeError` |
| Wrong key | Decrypt fails |

---

## Backup

- `backup-encrypted.sh` encrypts with GPG before copy
- Local GPG symmetric roundtrip passed
- Off-site target and recipient are documented steps, not configured here
- Restore into isolated Postgres: script exists (`restore-test.sh`), not executed (no Docker)

### Documented steps
1. Generate a backup GPG key on the server: `gpg --full-generate-key`
2. Set `BACKUP_GPG_RECIPIENT` to that key id
3. Set `OFFSITE_TARGET` to Storage Box or S3 path
4. Cron: `0 3 * * * /path/backup-encrypted.sh`
5. Test restore with `restore-test.sh` on a dump

---

## Open gaps

1. Full Postgres 16 integration suite not executed in this environment
2. Redis rate limiter not load-tested across workers
3. Recovery codes are not encrypted, only hashed (acceptable)
4. MFA pending tokens require the 025 migration to be applied

---

## VPS checklist

- [ ] Run `mfa-integration-test.sh` on a host with Docker before go-live
- [ ] Set `MFA_ENCRYPTION_KEY` (Fernet) in server env, not in git
- [ ] Set `REDIS_URL` so rate limits are shared
- [ ] Apply migrations through 025
- [ ] Enable MFA for SUPERADMIN and store recovery codes offline
- [ ] Configure GPG recipient and off-site target
- [ ] Confirm gateway publishes only 80/443
- [ ] Apply `/admin` allow-list only after WireGuard is up

---

## Decision

**Code is ready for a gateway VPS purchase for preparation.**  
**Do not enforce MFA in production until the Docker integration script has been run once and passed.**

---

## Constraints

No purchase, no production access, no existing server change, no DNS change, no merge to main.
