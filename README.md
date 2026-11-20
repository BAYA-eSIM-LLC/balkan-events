# BALKAN EVENTS

Regional Event Discovery and Ticketing Platform
Owner: BAYA eSIM LLC

## Quick Start (Local)

```bash
docker compose up -d --build
```

- Web: http://localhost:3000
- API: http://localhost:8000/docs
- Dashboard: http://localhost:3000/dashboard

## Deploy to Server

```bash
git clone https://github.com/BAYA-eSIM-LLC/balkan-events.git
cd balkan-events
cp .env.prod.example .env.prod
# Edit secrets in .env.prod
docker compose -f docker-compose.prod.yml up -d --build
```

## Structure
- apps/web - Next.js
- apps/mobile - React Native (iOS + Android)
- services/api - FastAPI
- docs/ - Phase 0 + ADRs
