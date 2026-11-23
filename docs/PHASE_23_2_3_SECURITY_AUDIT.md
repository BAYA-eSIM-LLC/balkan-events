# Phase 23.2.3 – MFA & Gateway Security Audit

**Date:** 2026-11-23  
**Reviewed:** 4f9bb93  
**Status:** Audit complete. Critical fix applied. Not deployed.

---

## Tests run

Local code review only. No production access. No running API in this environment, so no live HTTP tests.

| Check | Result |
|---|---|
| MFA login returns `mfa_required` for admin with MFA | Code path present |
| Refresh bypasses MFA | **Found and fixed** |
| Other login routes | Only `/auth/login` issues tokens |
| TOTP verify window | `valid_window=1` |
| Pending token expiry | **Added: 5 minutes, 5 attempts** |
| Recovery codes | Not implemented |
| Rate limit on login | Not implemented |
| WireGuard templates | Placeholders only |
| Docker bypasses UFW | Documented risk |
| Backup encryption | Not implemented |

---

## Vulnerabilities found

### Fixed in this commit
1. **Refresh token bypass.** An admin with MFA enabled could call `/auth/refresh` with an old refresh token and receive new access tokens without a TOTP code. Fixed: refresh now rejects admin users with `mfa_enabled`.
2. **No MFA token expiry or attempt limit.** Pending tokens lived until process restart. Fixed: 5-minute expiry, 5 failed attempts then invalidation.

### Open
3. **No recovery codes.** A lost authenticator locks the admin out. Must add one-time recovery codes before production MFA enforcement.
4. **TOTP secret stored in plaintext.** `totp_secret` is a plain column. Encrypt at rest before production.
5. **In-memory pending tokens.** Lost on restart and not shared across workers. Acceptable for a single process; move to Redis if scaled.
6. **No login rate limit.** Password guessing is not throttled. Add slowapi or Nginx `limit_req` before production.
7. **Docker published ports bypass UFW.** On Linux, Docker inserts iptables rules that skip UFW. Do not publish Postgres or API ports on the gateway. Bind only Nginx to 80/443.
8. **Backup not encrypted and not automated off-site.** `backup-offsite.sh` copies a file. Add `gpg` encryption and a cron entry.
9. **WireGuard keys are placeholders.** Real keys must be generated on the servers and never committed.
10. **`/admin` protection on the existing server is a document, not applied.** Until the allow-list is live, `/admin` remains reachable on the public API.

---

## Gateway checks

| Item | Status |
|---|---|
| WireGuard 10.10.0.1 / 10.10.0.2 | Templates only |
| Nginx proxies `/admin` and `/auth` | Config present |
| TLS paths | Placeholders |
| IP allow-list | Commented out |
| Public web unaffected | Yes, until allow-list is applied on existing host |
| UFW rules | 22, 80, 443, 51820/udp |

---

## Final checklist before purchase

- [ ] Accept that MFA recovery codes are still missing
- [ ] Accept that TOTP secret is not encrypted yet
- [ ] Plan Redis or single-worker for MFA pending tokens
- [ ] Generate WireGuard keys on the servers, not in git
- [ ] Do not publish any port except 80/443 on the gateway
- [ ] Apply `/admin` allow-list on the existing server only after WireGuard is up
- [ ] Encrypt off-site backups
- [ ] Run restore-test once after first backup
- [ ] Enable MFA for SUPERADMIN before any real admin use

---

## Decision

**Not ready for production admin use.**  
**Ready to purchase the gateway VPS for preparation**, provided:

- the VPS is used only as a gateway
- WireGuard and the `/admin` allow-list are applied together
- MFA is not enforced until recovery codes exist
- no production data is moved

---

## Constraints

No purchase, no DNS change, no deploy, no existing server change, no production database change, no merge to main.
