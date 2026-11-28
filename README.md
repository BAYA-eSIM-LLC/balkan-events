# BALKAN EVENTS

Regional Event Discovery and Ticketing Platform  
Owner: BAYA eSIM LLC  
Production: https://balkanevents.org

## Stack

- Backend: FastAPI, SQLAlchemy 2, Alembic, PostgreSQL 16, JWT + refresh tokens
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- Maps: OpenStreetMap embedded maps with Photon geocoding (no Google Maps API key or billing account required)

## Local development

```bash
# Backend
cd services/api
pip install -r requirements.txt
# set DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/balkan
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd apps/web
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret |
| `NEXT_PUBLIC_API_URL` | Public API base URL for frontend |

See `.env.prod.example` for production template. No Google Maps API key or payment method is needed for the event map integration.

The event map resolves the venue address with the public Photon geocoding service and displays an OpenStreetMap embed. Public geocoding and map tile services have fair-use policies and availability limits; for high traffic, use a hosted provider or self-hosted geocoding/tiles.

## CI

- Backend: `.github/workflows/backend-tests.yml` (PostgreSQL 16, pytest)
- Frontend: `.github/workflows/frontend-tests.yml` (Next.js build)

## Documentation

- `docs/ARCHITECTURE.md` – system overview
- `docs/SECURITY.md` – security findings and recommendations
- `docs/` – Phase 0 + ADRs

## Notes

- No Stripe or real payments in current phase.
- LedgerEntry is append-only (PostgreSQL trigger).
- Migrations 001–009 are additive.
