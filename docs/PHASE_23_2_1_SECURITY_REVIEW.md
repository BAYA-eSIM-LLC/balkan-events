# Phase 23.2.1 – Final Security & Architecture Review

**Date:** 2026-11-23  
**Reviewed commit:** 72ff896  
**Status:** Review only. No purchase. No execution.

---

## 1. How Super Admin uses the API today

Every Super Admin endpoint (`/admin/users`, `/admin/orders`, `/admin/organizations`, finance, settings) calls `Depends(get_db)` and queries the **same** PostgreSQL database as the public API. There is no separate admin data store in code.

Examples:
- `admin_system.py` dashboard counts users, events, orders from the main tables.
- `admin_orders_tickets.py` reads `Order` and `Ticket` from the main database.
- `admin_settings.py` reads and writes `PlatformSettings` in the main database.

---

## 2. Data ownership

| Data | Where it lives today |
|---|---|
| Users, organizers, events, orders, tickets, finance, settings | Main PostgreSQL |
| Audit log | Main PostgreSQL |
| Super Admin account | `users` table in main PostgreSQL |

A separate Super Admin database, as proposed in 23.2, would be empty. It cannot manage production users or orders unless it is a copy or a live connection.

---

## 3. Problems found

1. **Data duplication risk.** A second database would drift from the main one. Super Admin would show stale or missing data.
2. **MFA not implemented.** No TOTP or WebAuthn in the codebase.
3. **SSH not IP-restricted.** Bootstrap only disables password login.
4. **Backup is local only.** `03-backup.sh` writes to `/var/backups` on the same VPS. A disk failure loses backups.
5. **No restore test procedure.** `04-rollback.sh` exists but has never been tested.
6. **Bootstrap is not fully idempotent.** `gpg --dearmor` fails if the key file already exists.
7. **Secrets in `.env.admin`.** Correct location, but no rotation or secrets manager.
8. **Nginx TLS paths are placeholders.** Certificate must be obtained after DNS.
9. **Direct DB access from Super Admin is unsafe.** Opening the main Postgres port to the new VPS expands the attack surface.

---

## 4. Corrected architecture

Super Admin must **not** own a second copy of business data.

```
iPhone / browser
        │
        ▼
admin.<domain>  (new CPX22 — reverse proxy only)
  Nginx + optional IP allow-list / WireGuard
        │
        │  HTTPS
        ▼
existing CPX22 API
  FastAPI /admin  →  main PostgreSQL
```

The new VPS is a **restricted gateway**. It does not run its own database for users, orders or events. It proxies `/admin` to the existing API over a private network or mTLS.

If a private network is not available, use a WireGuard tunnel between the two VPS hosts. Do not open Postgres to the internet.

---

## 5. MFA plan (before production use)

1. Add `pyotp` and `qrcode` to the API.
2. Add `User.totp_secret` (nullable) and `User.mfa_enabled`.
3. Migration: `ALTER TABLE users ADD COLUMN totp_secret TEXT, ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE`.
4. Endpoints:
   - `POST /auth/mfa/setup` — returns provisioning URI (shown once).
   - `POST /auth/mfa/verify` — confirms code, sets `mfa_enabled`.
   - Login returns a short-lived `mfa_token` if MFA is on; `POST /auth/mfa/confirm` exchanges it for access tokens.
5. Enforce MFA for `SUPERADMIN` and `ADMIN` before any production admin login.
6. Store the TOTP secret encrypted at rest.

This is not implemented yet. Do not treat Super Admin as production-ready until it is.

---

## 6. Required fixes before purchase

| Fix | Action |
|---|---|
| Architecture | Drop the separate admin database. Use reverse proxy or WireGuard to the existing API. |
| MFA | Implement TOTP as above before real admin use. |
| SSH | Add `AllowUsers beadmin` and document IP allow-list or WireGuard. |
| Backup | Copy dumps to Hetzner Storage Box or S3-compatible storage. Keep 7 daily off-site. |
| Restore test | Document and run a restore on a throwaway database before go-live. |
| Bootstrap | Make `gpg --dearmor` and user creation idempotent. |
| Secrets | Generate on the server. Never commit. Rotate JWT secret independently. |

---

## 7. Pre-purchase checklist

- [ ] Confirm the existing CPX22 API is reachable over a private path or WireGuard.
- [ ] Decide DNS name (`admin.<domain>`).
- [ ] Generate Ed25519 key on iPhone. Paste only the public key at order time.
- [ ] Choose location (Falkenstein or Helsinki).
- [ ] Accept that MFA must be built before production admin use.
- [ ] Accept that this VPS is a gateway, not a second database.
- [ ] Budget ~€9–12/mo for CPX22 plus ~€3/mo for off-site backup storage.

---

## 8. Cost estimate

| Item | Monthly |
|---|---|
| Hetzner CPX22 (3 vCPU, 4 GB, 80 GB) | ~€9–12 |
| Off-site backup (Storage Box BX11 or similar) | ~€3 |
| IPv4 (if charged separately) | ~€0.50 |
| **Total** | **~€13–16** |

---

## 9. Constraints honored

- No server purchased.
- No deploy.
- Existing server not modified.
- Production database not modified.
- No merge to main.
