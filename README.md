# BALKAN EVENTS

Regional Event Discovery and Ticketing Platform  
Owner: BAYA eSIM LLC  
Production: https://balkanevents.org

## Stack

- Backend: FastAPI, SQLAlchemy 2, Alembic, PostgreSQL 16, JWT + refresh tokens
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS

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

See `.env.prod.example` for production template. **Never commit real secrets.**

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
