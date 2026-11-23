# Phase 23.1 – Server Architecture & Infrastructure Planning

**Date:** 2026-11-23  
**Branch:** super-admin-dashboard  
**Status:** Planning only. No servers purchased. No production changes.

---

## 1. Existing architecture (from code)

| Component | Present | Notes |
|---|---|---|
| FastAPI backend | Yes | `services/api`, JWT + bcrypt, Alembic |
| PostgreSQL 16 | Yes | `docker-compose.yml` and prod compose |
| Redis | Yes | In local compose; not wired as a job queue |
| Next.js 15 web | Yes | `apps/web` |
| React Native + Expo | Yes | `apps/mobile` |
| Super Admin | Yes | `/admin` routes, RBAC |
| Organizer | Yes | `/organizer` routes, event-level caps |
| POS | Yes | Cash only, no Stripe |
| QR Scanner | Yes | User JWT + device token |
| Email | Partial | SMTP optional, `EmailLog` queue, no Celery/ARQ |
| Background jobs | No | No worker process found |
| Nginx | Yes | In `docker-compose.prod.yml` |
| MFA | No | Not implemented |
| Stripe | Test only | Not for production |

Existing deploy files: `docker-compose.yml`, `docker-compose.prod.yml`, `deploy/prod`, `deploy/staging`.

---

## 2. Proposed architecture

```
                    ┌─────────────────────────────┐
                    │  Cloudflare / DNS + TLS     │
                    └─────────────┬───────────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
   ┌────────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
   │  Public web     │   │  API            │   │  Super Admin    │
   │  Next.js        │   │  FastAPI        │   │  restricted     │
   │  balkanevents   │   │  api.           │   │  admin.         │
   └────────┬────────┘   └────────┬────────┘   └────────┬────────┘
            │                     │                     │
            │              ┌──────▼──────┐              │
            │              │ PostgreSQL  │              │
            │              │ 16          │              │
            │              └──────┬──────┘              │
            │              ┌──────▼──────┐              │
            │              │ Redis       │              │
            │              │ (sessions / │              │
            │              │  rate limit)│              │
            │              └─────────────┘              │
            │                                           │
   ┌────────▼───────────────────────────────────────────▼────────┐
   │  Development server (separate DB, separate secrets)         │
   └─────────────────────────────────────────────────────────────┘
```

Mobile apps talk to the same API. No second user table.

---

## 3. Super Admin environment

- Separate hostname (e.g. `admin.<domain>`), not mixed into the public site.
- Nginx allow-list for admin paths, or a small WireGuard VPN.
- Super Admin login only over HTTPS.
- MFA: not implemented today. Plan to add TOTP before production admin access.
- Audit log already exists; keep it append-only.
- Daily backup of the admin audit tables with the main DB dump.
- No Super Admin credentials in the public web image.

---

## 4. Development server

| Item | Spec |
|---|---|
| OS | Ubuntu 24.04 LTS |
| Runtime | Docker + Docker Compose |
| API | FastAPI (existing Dockerfile) |
| DB | PostgreSQL 16, separate volume, separate credentials |
| Cache | Redis |
| Web | Next.js |
| Proxy | Nginx + Let's Encrypt |
| Access | SSH key only, no password login |

Purpose: real device testing of the mobile app, organizer flows, POS and scanner. Not for real payments.

---

## 5. Production architecture (future)

- Separate VPS or dedicated host.
- Separate PostgreSQL volume and credentials.
- Never copy the development database into production.
- Never reuse development passwords, JWT secrets or SSH keys.
- Stripe remains off until a later payment phase.
- Object storage for images and PDFs when upload is added.

---

## 6. Cost comparison (November 2026 list prices, excl. VAT)

### Economy (~€10–15/mo)
| Provider | Plan | CPU | RAM | Disk | Price |
|---|---|---|---|---|---|
| Hetzner | CX33 | 4 | 8 GB | 80 GB NVMe | ~€9 |
| OVHcloud | VPS-2 | 4 | 8 GB | 75 GB NVMe | ~€8.50 |
| Contabo | Cloud VPS 4 | 4 | 8 GB | 100 GB SSD | ~€6 |

One server runs API + web + Postgres + Redis. Fine for development. Tight for production under load.

### Recommended (~€20–35/mo)
| Provider | Plan | CPU | RAM | Disk | Price |
|---|---|---|---|---|---|
| Hetzner | CX43 | 8 | 16 GB | 160 GB NVMe | ~€16 |
| OVHcloud | VPS-4 | 8 | 24 GB | 200 GB NVMe | ~€23 |
| Contabo | Cloud VPS 8 | 8 | 24 GB | 300 GB SSD | ~€17 |

Comfortable for development and early production. Room for backups and a staging container.

### Advanced (~€50–80/mo)
| Provider | Plan | CPU | RAM | Disk | Price |
|---|---|---|---|---|---|
| Hetzner | CX53 | 16 | 32 GB | 320 GB NVMe | ~€30 |
| Hetzner | CCX23 | 4 dedicated | 16 GB | 160 GB NVMe | ~€73 |
| Contabo | Cloud VPS 12 | 12 | 48 GB | 400 GB SSD | ~€30 |

For growth, dedicated DB, or high concurrent POS/scanner load.

Add ~€1–3/mo for automated backups and ~€0.50 for a public IPv4 where charged separately.

---

## 7. Security plan

- Firewall: allow 22 (SSH, key only), 80, 443. Deny all else.
- SSH: Ed25519 keys, no root password, fail2ban.
- TLS: Let's Encrypt via Nginx or Caddy. Auto-renew.
- Secrets: `.env` files on the host, not in git. Separate per environment.
- DB: listen only on the Docker network. No public Postgres port.
- Backups: daily `pg_dump` to object storage or a second volume. Keep 7 daily, 4 weekly.
- Monitoring: Uptime Kuma or similar, disk and memory alerts.
- Logs: Docker json-file with rotation. Audit log stays in PostgreSQL.
- Disaster recovery: restore drill once before any real launch.

---

## 8. Migration and connection plan

1. Provision the development server after approval.
2. Clone `super-admin-dashboard`.
3. Run `docker compose` with a fresh Postgres 16.
4. Run Alembic migrations.
5. Create Super Admin via existing CLI.
6. Point mobile `EXPO_PUBLIC_API_URL` at the development API.
7. Test auth, tickets, POS and scanner on a real device.
8. Production is a later phase with a new host and new secrets.

---

## 9. Recommendation

**Buy one Hetzner CX43 (8 vCPU, 16 GB, 160 GB NVMe, ~€16/mo) in Falkenstein or Helsinki as the development server.**

Reasons:
- EU location, low latency to the Balkans.
- NVMe and predictable performance.
- Easy to resize later.
- Clear separation from any future production host.

Do not buy a second production server until payments and device testing are done.

---

## 10. Constraints honored

- No server purchased.
- No production changes.
- No merge to main.
- No business logic changes.
- No invented IP addresses or credentials.
