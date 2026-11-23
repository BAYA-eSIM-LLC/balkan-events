# Known Gaps & Technical Debt – Phase 7

## Backend

- No rate limiting on auth endpoints
- CORS allows `*` (restrict in production)
- No email sending implementation (verification/reset tokens generated but not delivered)
- Favorites API exists but limited frontend integration
- No structured data (JSON-LD) for events
- Stripe fee is recorded only when the actual balance transaction is available (not invented)
- Late payments after reservation expiry are marked `payment_late` and do not issue tickets (manual review required)

## Frontend

- Tokens in localStorage (XSS risk)
- No auto refresh-token rotation on 401
- No map on event detail page
- No favorites UI
- No frontend unit tests yet (build CI only)
- Mobile responsiveness is basic (Tailwind grid)
- No Stripe Checkout UI integration (backend only in Phase 7)

## Payments (Phase 7 – TEST MODE only)

- Stripe Connect not implemented (see STRIPE_CONNECT_ANALYSIS.md)
- No real payouts or bank accounts
- No production keys
- Webhook endpoint requires STRIPE_WEBHOOK_SECRET

## Not in scope (explicitly deferred)

- Production deployment
- Production migrations
- Real charges or payouts

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
| I | Stripe Checkout + webhook + ticket issuance | Covered by Phase 7 tests (mocked) |

Existing backend test suite (PostgreSQL 16) covers the critical paths above.
