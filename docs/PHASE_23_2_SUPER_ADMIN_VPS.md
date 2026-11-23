# Phase 23.2 – Super Admin VPS Plan

**Date:** 2026-11-23  
**Branch:** super-admin-dashboard  
**Status:** Plan and scripts only. No server purchased. No execution.

---

## 1. Existing code

Super Admin is part of the FastAPI app (`/admin` routes). It uses the same PostgreSQL database as the rest of the platform. MFA is not implemented in code. Audit log exists. RBAC exists (`SUPERADMIN`, `ADMIN`, organizer roles).

This plan runs a **separate** Super Admin instance with its **own** database. It does not connect to the production database on the existing CPX22.

---

## 2. Architecture

```
iPhone / browser
        │
        ▼
admin.<domain>  (new CPX22)
  Nginx (HTTPS, optional IP allow-list)
    ├─ Next.js web
    └─ FastAPI /admin
         ├─ PostgreSQL 16 (admin only)
         └─ Redis
```

Existing CPX22 (web + API) is not modified.

---

## 3. SSH key from iPhone

Use the free app **Termius** or **Blink Shell** on iPhone.

1. Open the app.
2. Create a new key: Ed25519, name `balkan-admin`.
3. Export or copy the **public** key (starts with `ssh-ed25519`).
4. Keep the private key in the app. Do not email it.

When ordering the Hetzner server, paste the public key into the SSH key field.

---

## 4. iPhone steps (after approval)

### Order the server (you do this)
1. Hetzner Cloud → New project or existing.
2. Add server: Ubuntu 24.04, CPX22, location Falkenstein or Helsinki.
3. Add the `balkan-admin` public key.
4. Note the public IP. Do not share it here.

### First login
1. In Termius, new host: the new IP, user `root`, key `balkan-admin`.
2. Connect.
3. Run:
   ```
   curl -fsSL https://raw.githubusercontent.com/BAYA-eSIM-LLC/balkan-events/super-admin-dashboard/deploy/super-admin/01-bootstrap.sh | bash
   ```
   Or copy the script content and paste it.

### Deploy
1. Reconnect as `beadmin`.
2. Clone the repo:
   ```
   git clone -b super-admin-dashboard https://github.com/BAYA-eSIM-LLC/balkan-events.git
   cd balkan-events/deploy/super-admin
   ```
3. Create `.env.admin` from `.env.admin.example`. Set a long random password and JWT secret. Do not reuse production secrets.
4. Run `./02-deploy.sh`.
5. Create Super Admin:
   ```
   docker compose -f docker-compose.admin.yml exec api python -m scripts.create_superadmin
   ```
   The password is shown once. Store it in your password manager.

### DNS and HTTPS
1. At your DNS provider, add `A` record `admin` → new server IP.
2. After DNS propagates, obtain a certificate (Certbot or Caddy). Replace `admin.example` in `nginx.conf`.

### Backup
Add a cron entry as `beadmin`:
```
0 3 * * * /home/beadmin/balkan-events/deploy/super-admin/03-backup.sh
```

---

## 5. Security

| Control | Status |
|---|---|
| SSH key only | Script sets `PasswordAuthentication no` |
| Firewall | UFW: 22, 80, 443 |
| Fail2ban | Installed |
| DB not public | No published Postgres port |
| Separate secrets | `.env.admin` on this host only |
| MFA | Not in code. Add TOTP before real admin use |
| IP allow-list | Commented in nginx.conf |
| Audit log | Existing backend feature |
| RBAC | Existing backend feature |

---

## 6. Connection to existing API

This Super Admin instance does **not** query the production database. If you later need to manage production data, the safe path is:

- Super Admin calls the existing API over HTTPS with a service token, or
- You use the existing production admin after a controlled cutover.

Do not open the production Postgres port.

---

## 7. Rollback

`04-rollback.sh` restores the latest admin database dump. It only affects this server.

---

## 8. Constraints honored

- Existing CPX22 not touched.
- No production database change.
- No production deploy.
- No merge to main.
- No server purchased by this process.
- No secrets requested.

---

## 9. Files

- `deploy/super-admin/01-bootstrap.sh`
- `deploy/super-admin/02-deploy.sh`
- `deploy/super-admin/03-backup.sh`
- `deploy/super-admin/04-rollback.sh`
- `deploy/super-admin/docker-compose.admin.yml`
- `deploy/super-admin/nginx.conf`
- `deploy/super-admin/.env.admin.example`
