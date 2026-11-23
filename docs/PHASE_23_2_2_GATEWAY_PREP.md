# Phase 23.2.2 – Gateway Implementation Preparation

**Date:** 2026-11-23  
**Status:** Prepared. Not executed. No server purchased.

---

## Architecture

```
Browser / iPhone
        │
        ▼
admin.<domain>   (new CPX22 — gateway only)
  Nginx + TLS + optional IP allow-list
        │
        │  WireGuard 10.10.0.2 → 10.10.0.1
        ▼
existing CPX22 API
  FastAPI /admin  →  main PostgreSQL
```

No second database. Public web and API on the existing server stay unchanged until the `/admin` allow-list is applied.

---

## Files

| File | Purpose |
|---|---|
| `deploy/gateway/nginx-gateway.conf` | Reverse proxy for `/admin` and `/auth` |
| `deploy/gateway/wireguard-gateway.conf` | WireGuard on the new VPS |
| `deploy/gateway/wireguard-existing.conf` | WireGuard peer to add on existing server (not applied) |
| `deploy/gateway/ufw-gateway.sh` | Firewall: 22, 80, 443, 51820/udp |
| `deploy/gateway/protect-admin-on-existing.md` | How to restrict `/admin` on the existing host |
| `deploy/gateway/backup-offsite.sh` | Copy dumps off-site |
| `deploy/gateway/restore-test.sh` | Restore into a throwaway Postgres |
| `services/api/app/models/user.py` | `totp_secret`, `mfa_enabled` |
| `services/api/alembic/versions/024_mfa.py` | Migration |
| `services/api/app/routers/auth.py` | MFA setup, enable, confirm |

---

## MFA

- `POST /auth/mfa/setup` — admin only, returns secret and URI
- `POST /auth/mfa/enable` — confirms code, sets `mfa_enabled`
- Login for `SUPERADMIN`/`ADMIN` with MFA returns `{mfa_required, mfa_token}`
- `POST /auth/mfa/confirm` — exchanges token + code for access tokens
- Pending tokens are in-memory (single process). For multi-worker, move to Redis later.

---

## iPhone install steps (after approval)

1. Order CPX22, Ubuntu 24.04, paste public key.
2. SSH as root, run `deploy/super-admin/01-bootstrap.sh`.
3. Install WireGuard: `apt install wireguard`.
4. Generate keys, fill `wireguard-gateway.conf`, `wg-quick up wg0`.
5. On the existing server (separate approval): add the peer from `wireguard-existing.conf`.
6. Copy `nginx-gateway.conf`, replace IPs and domain, obtain certificate.
7. Run `ufw-gateway.sh`.
8. After DNS, test `https://admin.<domain>/admin/` from an allowed IP.
9. Enable MFA for the Super Admin account via `/auth/mfa/setup`.

---

## Security tests (to run after deploy)

- [ ] `/admin` on the public API returns 403 from a non-gateway IP
- [ ] `/admin` via the gateway returns 200 with a valid admin token
- [ ] Login without MFA code is rejected when `mfa_enabled`
- [ ] Wrong TOTP code is rejected
- [ ] Public `/events` still works on the existing server
- [ ] WireGuard ping 10.10.0.1 from gateway succeeds
- [ ] Off-site backup file exists and restore-test lists tables

---

## Monitoring and recovery

- Uptime check on `https://admin.<domain>/admin/` from an external monitor.
- If the gateway dies: public API and web keep running. Admin access is temporarily unavailable.
- Recovery: rebuild the CPX22 from these scripts, restore WireGuard keys from your password manager, re-apply Nginx.

---

## Constraints

- No purchase
- No deploy
- No DNS change
- Existing server not modified
- Production database not modified
- No merge to main
