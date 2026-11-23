# Phase 23.12.1 – Tunnel check and Gateway readiness

**Date:** 2026-11-23  
**Status:** Checks only. Nginx not started. Production not modified.

---

## Tasks

| # | Task | Status | Evidence |
|---|---|---|---|
| 1 | WireGuard status on gateway | PASS | `wg0` active, handshake 1m56s ago, transfer 1.13 KiB / 696 B |
| 2 | `curl http://10.10.0.1:8000/health` | PASS | HTTP/1.1 200 OK, `{"status":"healthy"}`, server uvicorn |
| 3 | Private API access | PASS | Response came over the tunnel from 10.10.0.1 |
| 4 | Nginx routes in repo | PASS | `/admin/`, `/auth/`, `/health` present |
| 5 | Authorization and proxy headers in repo | PASS | explicit on all three locations |
| 6 | Docker Compose profile `admin` | PASS | nginx will not start without `--profile admin` |
| 7 | `nginx -t` on system | BLOCKED | Nginx not started; cert paths are placeholders |
| 8 | Staged file on gateway matches repo | FAIL | `/opt/balkan-gateway/nginx/nginx.conf` is the older copy: no `/health`, no explicit Authorization |

---

## Commands

```
ssh root@2.29.199.6
wg show
curl -i --max-time 5 http://10.10.0.1:8000/health
./deploy/super-admin-gateway/validate-config.sh
```

Handshake peer: `UyUxKV17GewcGEG6XkkUlk96IPoDNMlhCTKTaYUDc28=`  
AllowedIPs: `10.10.0.1/32`  
System Nginx: inactive  
UFW: not modified

---

## Remaining steps before activation

1. Replace the staged nginx.conf on the gateway with the repo version (needs approval; it is a gateway file, not production).
2. Approve a DNS name for `admin.<domain>`.
3. Obtain a real certificate. Do not use a placeholder.
4. Only then `docker compose --profile admin up -d`.
5. Confirm `/health` via the gateway.
6. Allow-list on the public API is a separate approval. Do not restrict port 8000 until then.

---

## Not done

- Production API not modified
- Production database not modified
- Docker containers on production not modified
- UFW not changed
- Public port 8000 not restricted
- DNS not changed
- Nginx not started
- Servers not restarted
- MFA not changed
- No merge to main
- No Stripe
- No private keys printed
