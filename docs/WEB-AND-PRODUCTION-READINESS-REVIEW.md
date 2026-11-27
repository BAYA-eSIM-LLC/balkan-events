# Web review and production-readiness findings

Date: 2026-11-28
Repository: BAYA-eSIM-LLC/balkan-events
Branch: feat/production-readiness-and-web-refresh

## Scope and evidence

This review is based on the current GitHub source files and repository documentation. The live URL https://balkanevents.org could not be fetched by the available browser inspection, so no claim is made that the live deployment matches the current `main` branch. No production server, database, payment account, or deployment was accessed. No test, build, migration, or install command was run.

Files inspected include the Next.js home page, layout, global CSS, header, event card, event detail, login, registration, profile, API client, Tailwind configuration, Dockerfiles, FastAPI entry point, authentication/security helpers, event and organizer/admin routers, inventory service, payment/ticket/ledger models, requirements, and CI workflows.

## Changes prepared on this branch

- Replaced the homepage's unsupported `/events/popular` request with the backend's implemented `/events/featured` endpoint. The prior request silently returned an empty list because the API client converts non-2xx responses to an empty array.
- Reworked the homepage into a responsive, premium navy/blue/violet visual hierarchy, with featured and upcoming sections and an honest empty state.
- Rebuilt the header with responsive mobile navigation, accessible labels, and a search form.
- Improved event cards with stronger visual hierarchy, responsive image treatment, focus states, featured labels, and an intentional no-image fallback.
- Added global visual foundations and reduced-motion support.

These are source changes only. They are not yet deployed and have not been built or tested.

## Confirmed issues requiring follow-up

### Critical before production payments

1. **No real checkout or payment integration.** The event detail page explicitly says ticket purchase is unavailable; the README also says there are no Stripe or real payments. Do not advertise ticket sales or activate live charges until payment-provider marketplace eligibility, country support, connected-account/payout model, webhook signature verification, idempotency, refunds, reconciliation, and legal review are complete.
2. **Money represented as decimal numeric fields.** Ticket/payment/ledger models use Numeric amounts. The target design should standardize integer minor units plus ISO currency, with a reviewed reversible migration and compatibility plan before launch.
3. **Ticket QR and admission controls need security verification.** Ticket model includes a code and QR data, but signed/opaque QR issuance, atomic one-time scan, replay protection, and concurrent scan behavior must be demonstrated by integration tests before real events.
4. **Production secrets and deployment configuration need review.** The example environment file contains placeholder credentials, and the API settings have a development fallback secret. Verify production environment injection and fail-fast behavior without exposing values.

### High priority

1. Auth tokens are stored in browser localStorage, exposing them to script execution if an XSS flaw occurs. Migrate to secure HttpOnly/SameSite cookies with CSRF protection and coordinated backend/frontend tests.
2. FastAPI CORS currently allows all origins and credentials. Restrict to explicit production origins.
3. Auth endpoints lack rate limiting and abuse controls according to the repository's own known-gaps document.
4. Email verification and password-reset delivery are not implemented according to known gaps. Do not imply those flows work.
5. Frontend CI TypeScript step uses `|| echo`, which can make a failing type check appear successful. Remove the failure-swallowing behavior in a separately reviewed CI change.
6. The frontend has no dedicated unit tests, according to known gaps. Add tests for search, auth forms, navigation, empty states, and event rendering.
7. No frontend lockfile appears in the inspected repository tree. Add and enforce a deterministic package lock before relying on reproducible builds.
8. Production Docker/Compose and Nginx setup needs a deployment review: TLS termination, security headers, health/readiness, non-root execution, image pinning, backup/restore, and migration sequencing were not verified.

### Functional correctness

- The home page previously queried `/events/popular`, while the inspected API exposes `/events/featured`. This mismatch was corrected on this branch.
- Registration returns tokens from the backend but the frontend sends the user to the login page rather than completing a consistent authenticated session. Align this with the secure cookie migration.
- Event detail currently has no purchase flow. This remains intentionally unimplemented rather than using a fake checkout.
- The API client intentionally converts request failures to empty arrays/null; add observable server-side logging and distinguish genuine empty results from upstream errors without leaking internal details to visitors.

## Test and deployment status

- Automated tests: NOT RUN (read-only inspection / no local runtime access).
- Frontend build and typecheck: NOT RUN.
- Backend test suite: NOT RUN.
- Database migrations: NOT RUN.
- Live production parity: UNVERIFIED.
- Payment provider approval and live eligibility: UNVERIFIED; requires written provider confirmation and qualified legal review.
- Deployment: NOT performed. No production configuration or data was changed.

## Recommended sequence

1. Review and merge the visual/API correction only after CI passes on this branch.
2. Fix CI reliability and add frontend lockfile/tests.
3. Complete auth hardening (HttpOnly cookies, CSRF, rate limits, CORS, email delivery) with integration tests.
4. Complete ticket lifecycle, inventory reservations/expiry, signed QR and single-entry scanning with real PostgreSQL concurrency tests.
5. Design payment/ledger/reconciliation adapter and country-specific legal/provider approvals; only then implement sandbox checkout.
6. Complete production deployment, TLS/security headers, monitoring, backups and a restore drill.
7. Run a production-readiness acceptance checklist before enabling live sales.

## Explicit stop conditions

Do not deploy these changes automatically. Do not enable live payments, payouts, ticket sales, or production migrations without separate owner approval and provider/legal clearance. This branch is isolated from `main`.
