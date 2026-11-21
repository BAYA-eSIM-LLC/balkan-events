# BALKAN EVENTS – Architecture

## Overview

Monorepo with:
- `services/api` – FastAPI + SQLAlchemy + Alembic + PostgreSQL 16
- `apps/web` – Next.js 15 + React 19 + TypeScript + Tailwind CSS

## Modules

| Phase | Scope |
|-------|-------|
| Foundation | Auth (JWT + refresh), inventory, immutable ledger |
| CORE 1A | User profiles, email verification, password reset, sessions |
| CORE 1B | Countries, cities, categories (ISO seed) |
| CORE 1C | Events engine, venues, performers, status lifecycle |
| CORE 1D | Advanced search, popularity ranking, venue/performer admin |
| CORE 1E | Organizer portal, KYB, team roles |
| CORE 1F | Admin system, support tickets, admin notes, granular RBAC |
| CORE 1G | Public Next.js web (home, search, event detail, auth, profile) |

## Migrations

001–009 (additive only). LedgerEntry protected by PostgreSQL trigger (003).

## RBAC

- User roles: user, admin, superadmin, event_moderator, organizer_reviewer, finance_admin, support_admin, security_admin
- Org roles: owner, admin, staff

## Security notes

- Tokens: JWT access + rotating refresh (hashed in DB)
- Frontend stores tokens in localStorage (XSS risk – planned httpOnly cookies later)
- No Stripe / real payments active
- debug_token removed from production responses

## Local development

```bash
docker compose up -d
cd services/api && alembic upgrade head && uvicorn app.main:app --reload
cd apps/web && npm install && npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000`.
