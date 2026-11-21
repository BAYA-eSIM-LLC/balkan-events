# BALKAN EVENTS Web

Next.js frontend for the public user platform.

## Stack
- Next.js 15 + React 19
- TypeScript
- Tailwind CSS

## Development
```bash
cd apps/web
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` to point to the backend (default: http://localhost:8000).

## Notes
- No real payments or Stripe in this phase.
- Only published events are displayed.
- Auth tokens stored in localStorage (client-side).
