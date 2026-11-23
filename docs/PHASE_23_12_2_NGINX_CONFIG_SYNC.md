# Phase 23.12.2 – Nginx configuration sync (gateway only)

**Date:** 2026-11-23  
**Status:** Complete. Nginx not started. Production not modified.

---

## 1. Server

- Hostname: `ubuntu-4gb-hel1-5`
- IP: `2.29.199.6`
- Confirmed before the change

## 2. Source

- Branch: `super-admin-dashboard`
- Commit: `8524eb3`
- File: `deploy/super-admin-gateway/nginx.conf`

## 3. Replaced file

- `/opt/balkan-gateway/nginx/nginx.conf`

## 4. Backup

- `/opt/balkan-gateway/nginx/nginx.conf.backup-20261123-173435`
- Original was not deleted before the copy

## 5. Diff

`diff -u` between the uploaded source and the installed file: **identical**.

## 6. Routes and headers

| Item | Present |
|---|---|
| `/admin/` | yes |
| `/auth/` | yes |
| `/health` | yes |
| `Authorization` | yes, explicit on all three |
| Host, X-Real-IP, X-Forwarded-For, X-Forwarded-Proto | yes |

## 7. Certificate paths

Placeholders, not real certificates:

- `/etc/letsencrypt/live/admin.example/fullchain.pem`
- `/etc/letsencrypt/live/admin.example/privkey.pem`

## 8. Syntax validation

**BLOCKED.** `nginx` is not installed on the host. Per instructions, no package was installed, no image was pulled, and no container was started.

## 9. Confirmations

- System Nginx: inactive
- Docker Compose profile `admin`: not started
- WireGuard, UFW, SSH, Compose file: not modified
- Production 2.29.195.181: not contacted
- DNS, TLS, allow-list: not changed
