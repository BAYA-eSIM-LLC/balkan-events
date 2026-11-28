# BALKAN EVENTS

Regional Event Discovery and Ticketing Platform  
Owner: BAYA eSIM LLC  
Production: https://balkanevents.org

## Stack

- Backend: FastAPI, SQLAlchemy 2, Alembic, PostgreSQL 16, JWT + refresh tokens
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- Maps: Google Maps JavaScript API (event venue and city map)

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
NEXT_PUBLIC_API_URL=http://localhost:8000 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-restricted-key npm run dev
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret |
| `NEXT_PUBLIC_API_URL` | Public API base URL for frontend |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Browser key restricted to the BALKAN EVENTS website and Maps JavaScript API |

See `.env.prod.example` for production template. Add the real Maps key to the server's untracked `.env.prod` file. **Never commit real secrets or API keys.**

For production deployment, the deploy script passes `.env.prod` to Docker Compose at build time so the public Maps key is embedded into the Next.js client bundle. Rebuild the web container after changing the key.

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
