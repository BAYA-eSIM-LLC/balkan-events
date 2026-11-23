# Phase 23.4 – Super Admin Infrastructure Preparation

**Date:** 2026-11-23  
**Host:** 2.29.199.6  
**Status:** Prepared. Not started. No DNS. No peer. No production changes.

---

## 1. Current gateway

- Ubuntu 24.04, WireGuard `wg0` at 10.10.0.2/24, no peer
- UFW: 22, 80, 443, 51820/udp
- Docker installed, no containers
- Configs staged in `/opt/balkan-gateway/nginx/`

---

## 2. Proposed architecture

```
Browser
   │
   ▼
admin.<domain>          2.29.199.6 (gateway)
   Nginx 80/443
   │
   │  WireGuard 10.10.0.2 → 10.10.0.1
   ▼
existing API            2.29.195.181
   FastAPI /admin → main PostgreSQL
```

The gateway does not run Postgres. Super Admin data stays in the main API database. Communication is HTTPS to the API only.

---

## 3. Hostname and access

- Proposed hostname: `admin.<domain>` (DNS not set)
- Access: HTTPS only, optional IP allow-list in Nginx
- SSH: existing key, port 22, unchanged
- No public Postgres or Redis

---

## 4. Docker Compose

File: `deploy/super-admin-gateway/docker-compose.yml`  
Copied to `/opt/balkan-gateway/nginx/docker-compose.yml`

- Service `nginx` is under profile `admin`
- `docker compose up` without `--profile admin` starts nothing
- Not started

---

## 5. Auth, MFA, RBAC

- Login via existing `/auth/login` on the API
- MFA endpoints already in code: setup, enable, confirm, recovery codes
- RBAC: `SUPERADMIN` and `ADMIN` enforced by the API
- MFA is not enforced until the Postgres 16 integration script has passed
- Encryption key lives on the API host, not on the gateway

---

## 6. API-only communication

- Nginx proxies `/admin/` and `/auth/` to `10.10.0.1:8000`
- No direct database connection from the gateway
- Peer is not configured; upstream will fail until WireGuard peer is approved

---

## 7. Audit and monitoring

- API already writes AuditLog for admin actions
- Gateway monitor cron checks ssh, wireguard, fail2ban, docker
- Future: Nginx access log shipped to the same monitor

---

## 8. Backup and recovery

- Gateway backup cron already copies WireGuard and UFW configs
- Add Nginx configs to the same archive when the stack is approved
- Recovery: restore `/etc/nginx` and `/etc/wireguard` from `/var/backups/gateway`
- Production database backup remains on the API host

---

## 9. Deployment docs (future, not now)

1. Approve DNS name
2. Approve WireGuard peer on both hosts
3. Run `test-private-link.sh`
4. Only then apply `/admin` allow-list on the API host
5. `docker compose --profile admin up -d`
6. Certbot for the chosen hostname
7. Enable MFA for SUPERADMIN after integration tests pass

---

## Risks

| Risk | Mitigation |
|---|---|
| Starting the stack before the peer exists | Profile `admin` prevents accidental start |
| Opening `/admin` on the public API | Allow-list only after private link test |
| Second database drift | Gateway has no database |
| MFA lockout | Recovery codes exist; do not enforce yet |

---

## Validation

- Config files present on server
- `docker ps` empty
- WireGuard still has no peer
- SSH still works
- Production host not contacted

---

## Constraints honored

No app start, no new containers, no peer, no DNS, no change to 2.29.195.181, no secrets disclosed.
