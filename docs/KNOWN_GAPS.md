# Known Gaps & Technical Debt – CORE 1H

## Backend

- No rate limiting on auth endpoints
- CORS allows `*` (restrict in production)
- No email sending implementation (verification/reset tokens generated but not delivered)
- Favorites API exists but limited frontend integration
- No structured data (JSON-LD) for events

## Frontend

- Tokens in localStorage (XSS risk)
- No auto refresh-token rotation on 401
- No map on event detail page
- No favorites UI
- No frontend unit tests yet (build CI only)
- Mobile responsiveness is basic (Tailwind grid)

## Not in scope (explicitly deferred)

- Stripe / real payments
- Production deployment
- Production migrations

## End-to-end scenarios (manual / future automated)

| Scenario | Description | Status |
|----------|-------------|--------|
| A | User register → login → edit profile | Covered by existing pytest |
| B | Organizer create org → submit verification | Covered by existing pytest |
| C | Admin approve organizer | Covered by existing pytest |
| D | Organizer create event → submit | Covered by existing pytest |
| E | Admin approve/publish event | Covered by existing pytest |
| F | User search and view event | Frontend + API ready |
| G | User create support ticket → admin process | Covered by existing pytest |
| H | Isolation (no cross-org / cross-user access) | Covered by existing pytest |

Existing backend test suite (PostgreSQL 16) covers the critical paths above.
