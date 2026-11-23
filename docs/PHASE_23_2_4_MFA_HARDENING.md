# Phase 23.2.4 – MFA Hardening & Security Fixes

**Date:** 2026-11-23  
**Status:** Implemented. Not deployed. No production access.

---

## Implemented

### 1. Recovery codes
- 10 one-time codes generated on `/auth/mfa/setup`
- Stored as SHA-256 hashes in `mfa_recovery_codes`
- Usable once via `/auth/mfa/confirm`
- Regenerated via `/auth/mfa/recovery/regenerate` after a valid TOTP

### 2. Encrypted TOTP
- `MFA_ENCRYPTION_KEY` from environment (Fernet)
- Secret encrypted before save, decrypted only for verify
- Key is not in git. Example line added to `.env.admin.example`
- Existing plaintext values: none in production (column just added). New setups are encrypted.

### 3. Pending tokens
- Stored in `mfa_pending` table
- 5-minute expiry, 5 attempts, then deleted
- Survives process restart

### 4. Rate limiting
- In-process limiter: 5 attempts / 5 minutes per email (login) and per MFA token prefix
- Returns 429

### 5. Docker
- Admin compose does not publish Postgres or Redis ports
- Only Nginx publishes 80/443

### 6. Off-site backup
- `deploy/gateway/backup-encrypted.sh` encrypts with GPG before copy
- Retention: local encrypted files older than 14 days deleted
- Requires `BACKUP_GPG_RECIPIENT` and `OFFSITE_TARGET`

### 7. Tests
- `services/api/tests/test_mfa.py` — encrypt roundtrip, recovery uniqueness
- Unit checks passed locally (no live DB required for these)

---

## Files

- `services/api/app/services/mfa.py`
- `services/api/app/models/mfa.py`
- `services/api/alembic/versions/025_mfa_codes.py`
- `services/api/app/routers/auth.py`
- `services/api/tests/test_mfa.py`
- `deploy/gateway/backup-encrypted.sh`
- `deploy/super-admin/.env.admin.example`

---

## Remaining

- Rate limiter is in-process (not shared across workers)
- Recovery codes shown only once at setup/regenerate
- Off-site target and GPG key must be configured on the server
- Full integration tests need a running Postgres 16

---

## Constraints

No production access, no existing server change, no DNS change, no purchase, no merge to main.
