# Phase 22.0 – Mobile Apps Audit & Architecture

**Branch:** super-admin-dashboard  
**Date:** 2026-11-23  
**Status:** Audit complete. Waiting for approval before 22.1.

## 1. Audit summary

### Backend
- FastAPI + PostgreSQL 16
- JWT access + refresh tokens (`/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`)
- Token response: `access_token`, `refresh_token`, `token_type`
- User identity is the same `users` table for web and any client

### Existing APIs reusable by mobile

| Area | Endpoints | Notes |
|------|-----------|-------|
| Auth | `/auth/register`, `/auth/login`, `/auth/refresh` | Same account as web |
| Profile | `/profile`, `/profile/password`, `/profile/favorites` | |
| Discovery | `/events/search`, `/events/discover`, `/events/autocomplete` | Published only |
| Events | `/events/`, `/events/{slug}` | |
| Orders | `POST /orders`, `GET /orders/me`, confirm/cancel | |
| Tickets | `GET /payments/my-tickets`, `GET /tickets/{id}/pdf` | Same tickets as web |
| Seat maps | `GET /seat-maps/event/{id}`, `POST /seat-maps/reserve`, checkout | |
| Preferences | `GET/PUT /me/preferences` | |
| Scanner | `POST /scanner/validate`, device token, offline sync | |
| Organizer | analytics, guest lists, team, POS, sponsors | RBAC enforced |

### Frontend
- Next.js web in `apps/web`
- No existing React Native / Expo app in the repo

### QR Scanner PRO
- Camera via `BarcodeDetector` on web
- Device token (`X-Device-Token`) or user JWT
- Offline queue with documented limitation

## 2. One account across platforms

The same `users` row and JWT are used by every client.

- Web login and mobile login call the same `/auth/login`
- Tickets are tied to `order.user_id` and `ticket` rows
- `GET /payments/my-tickets` returns the user’s tickets regardless of client
- No second account is required
- A ticket bought on web appears in the mobile app after login with the same credentials

## 3. Proposed architecture

**Stack:** React Native + Expo + TypeScript

Reasons:
- One codebase for iOS and Android
- Expo handles camera, secure storage, push, and builds
- TypeScript matches the existing web stack
- No separate native teams required for the first versions

**Location:** `apps/mobile`

**Structure:**
```
apps/mobile/
  app/                 # Expo Router screens
    (auth)/login.tsx
    (auth)/register.tsx
    (tabs)/home.tsx
    (tabs)/discover.tsx
    (tabs)/tickets.tsx
    (tabs)/profile.tsx
    event/[slug].tsx
    scanner.tsx
    organizer/...
  lib/
    api.ts             # shared fetch + token refresh
    auth.ts            # secure token storage
    types.ts
  app.json
  package.json
```

**Auth storage:** `expo-secure-store` for access and refresh tokens. No tokens in AsyncStorage or source.

**API client:** thin wrapper around existing REST endpoints. No duplicated business logic.

**Navigation:** Expo Router, tab bar for customer, stack for organizer and scanner.

## 4. Sub-phase plan

| Phase | Scope | Depends on |
|-------|-------|------------|
| 22.0 | This audit and architecture | — |
| 22.1 | App shell, navigation, auth (login/register/refresh) | 22.0 approved |
| 22.2 | Customer: home, discover, search, event, tickets, preferences | 22.1 |
| 22.3 | Organizer: dashboard, events, sales, guest lists, team | 22.2 |
| 22.4 | QR scanner with camera, device token, offline queue | 22.3 |
| 22.5 | Push notifications prep, performance, store metadata | 22.4 |

## 5. What will not be done in 22.0

- No mobile code
- No new API endpoints
- No store submission
- No Stripe
- No production changes

## 6. Risks and notes

- Camera QR on Expo uses `expo-camera` / `expo-barcode-scanner`, not the web `BarcodeDetector`
- Apple Wallet / Google Wallet are prepared as data only; pass generation is a later step
- Push requires Expo push credentials; sending stays disabled until configured
- Offline scanner limitation remains: concurrent double-entry across devices cannot be guaranteed without connectivity

## 7. Constraints

Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe.

Waiting for approval before **Phase 22.1**.

---

## Phase 22.1 – Foundation & Authentication

**Commit:** pending  
**Date:** 2026-11-23

### Versions
- Expo SDK 52
- React Native 0.76.3
- Expo Router 4
- TypeScript 5.6
- expo-secure-store 14

### Structure
```
apps/mobile/
  app/                 Expo Router screens
    (auth)/            login, register, forgot
    (tabs)/            home, profile, settings
    organizer/         organizer shell
  src/
    components/ features/ services/ hooks/ store/ theme/ types/ utils/
```

### Auth
- `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`
- `POST /profile/forgot-password`
- Tokens in SecureStore only
- Single-flight refresh
- 401 clears session and returns to login path

### API client
- Base URL from `expo.extra.apiUrl` or `EXPO_PUBLIC_API_URL`
- Not localhost-only
- Timeout 15s, 401 refresh, 403/500 mapped to detail

### Account compatibility
- Same `/auth/login` and `users` table as web
- New mobile registration creates a row in `users`
- No separate mobile account store

### Tests
- TypeScript `tsc --noEmit`: passed
- iOS/Android simulator: not run in this environment
- Physical device: not available

### Build prep
- iOS bundle: `org.balkanevents.app`
- Android package: `org.balkanevents.app`
- App name: BALKAN EVENTS
- Splash background `#0B0B0F`
- Not submitted to stores

### Not finished
- Customer screens (22.2)
- Organizer tools (22.3)
- Scanner (22.4)
- Push (22.5)
- Live screenshots

---

## Phase 22.2 – Customer Mobile App

**Commit:** pending  
**Date:** 2026-11-23

### Screens
- Home — discover sections from `/events/discover`
- Discover — search with city, pagination, infinite scroll
- Event detail — `/events/{slug}`, seat map sectors if present
- My Tickets — `/payments/my-tickets` (same tickets as web)
- My Orders — `/orders/me`
- Preferences — `/me/preferences`
- Profile, Settings (from 22.1)

### API integrations
- `/events/discover`, `/events/search`, `/events/{slug}`
- `/seat-maps/event/{id}`
- `/payments/my-tickets`
- `/orders/me`
- `/me/preferences`

### Tests
- TypeScript `tsc --noEmit`: passed
- iOS/Android simulator: not run
- Physical device: not available

### Not finished
- In-app seat selection UI (sectors listed; reservation stays on web)
- Camera QR display of ticket (raw qr_data shown)
- Organizer app (22.3)
- Scanner (22.4)
- Live screenshots

### Constraints
No Stripe, no in-app payment, no store submission.

---

## Phase 22.3 – Organizer Mobile App

**Commit:** pending  
**Date:** 2026-11-23

### Screens
- Organizer dashboard — `/analytics/organizer/{id}` (403 if no sales/finance cap)
- Events — organization detail events
- Team — members list, invite as viewer
- Guest lists — `/guest-lists/event/{id}`
- POS — sales points, cash only
- Scanners — attendance by event

### Security
- All data from backend. Finance hidden when API returns 403.
- Org isolation enforced by existing endpoints.
- No card payments.

### Tests
- TypeScript `tsc --noEmit`: passed
- Simulator / device: not run

### Not finished
- Event create/edit forms
- Guest add/check-in UI
- POS sale flow
- Camera scanner (22.4)
- Live screenshots

---

## Phase 22.4 – Mobile QR Scanner PRO

**Commit:** pending  
**Date:** 2026-11-23

### Screen
- `app/organizer/scanner.tsx`
- expo-camera `CameraView` with QR barcode scanning
- Manual code entry
- Event ID and entry point inputs
- Results: VALID (green), ALREADY_USED (yellow), WRONG_EVENT / INVALID (red)
- Dedupes same code within 2.5s
- Offline toggle labels result as not confirmed and states double-entry risk
- Counts valid and rejected
- Uses existing `POST /scanner/validate` — no local ticket marking

### Security
- Backend remains the authority
- User JWT from SecureStore
- Event-level `scan` capability enforced by API
- No sensitive user data shown

### Tests
- TypeScript `tsc --noEmit`: passed
- Backend scanner tests already cover VALID / ALREADY_USED / WRONG_EVENT / INVALID and device auth
- Camera on physical device: not tested in this environment

### Not finished
- Sound feedback
- Device token entry UI (header still user JWT)
- Live screenshots

---

## Phase 22.5 – Customer Tickets & Seat Selection

**Commit:** pending  
**Date:** 2026-11-23

### Tickets
- Visual QR from real `qr_data` via `react-native-qrcode-svg`
- Full-screen QR modal
- Status from backend (`is_used`)
- Seat id when present
- Refresh from `/payments/my-tickets`

### Seat selection
- `app/event/seats.tsx`
- Loads `/seat-maps/event/{id}`
- Colors: FREE green, RESERVED yellow, SOLD red
- Multi-select free seats
- Reserves via `POST /seat-maps/reserve`
- Shows price sum and expiry message
- Reloads on conflict
- No in-app payment; finish on web checkout

### Tests
- TypeScript `tsc --noEmit`: passed
- Backend seat concurrency tests already cover double reserve and expiry
- Physical device: not tested

### Not finished
- PDF ticket open in-app
- Event name/date on ticket card (API returns id, code, qr_data, is_used)
- Live screenshots

---

## Phase 22.6 – Organizer Event Management & Guest Check-in

**Commit:** pending  
**Date:** 2026-11-23

### Event management
- `app/organizer/events.tsx` — list own events via `GET /organizer/events`
- `app/organizer/event-create.tsx` — create via `POST /organizer/events`
- `app/organizer/event-edit.tsx` — load and patch via `GET/PATCH /organizer/events/{id}`
- Fields: title, short description, venue, start datetime
- Backend validates organization membership and event permissions

### Guest lists
- `app/organizer/guests.tsx` rewritten
- Load lists: `GET /guest-lists/event/{event_id}`
- Load/search guests: `GET /guest-lists/{list_id}/guests?q=`
- Add guest: `POST /guest-lists/{list_id}/guests`
- Check-in: `POST /guest-lists/guests/{guest_id}/check-in`
- Checked-in guests shown distinctly
- No local check-in logic; backend is authority

### Security
- All actions require existing user JWT
- Backend enforces org membership and event-level caps
- Finance data not shown
- No parallel validation

### Tests
- TypeScript `tsc --noEmit`: passed
- Backend guest and event tests already cover create, isolation and check-in
- Physical device: not tested

### Not finished
- Image upload (no upload endpoint on create)
- CSV import UI
- QR guest check-in (uses ticket scanner)
- Live screenshots

### Constraints
Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe, no store submission.

---

## Phase 22.7 – Mobile POS PRO

**Commit:** pending  
**Date:** 2026-11-23

### Screen
- `app/organizer/pos-sale.tsx`
- Load sales points for organization
- Open register with opening balance
- Load ticket types for event
- Select type and quantity
- Cash received and change calculation (local display only)
- Confirm sale via `POST /pos/sale` with idempotency key
- Show real tickets and QR from `BE:{code}:{order_id}`
- Close register with variance from backend

### APIs
- `GET /pos/sales-points`
- `POST /pos/registers/open`
- `POST /pos/registers/{id}/close`
- `GET /organizer/events/{id}/ticket-types`
- `POST /pos/sale`

### Security
- User JWT from SecureStore
- Backend enforces SalesPointStaff and event-level can_pos
- Sale rejected if register not open
- Idempotency key prevents double submit
- No card payments

### Tests
- TypeScript `tsc --noEmit`: passed
- Backend POS tests already cover open/close, cash sale, concurrency and isolation
- Physical device: not tested

### Not finished
- Seat selection inside POS (ticket type path used)
- Void sale UI
- Previous sales list
- Live screenshots

### Constraints
Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe, no store submission.

---

## Phase 22.8 – Mobile Integration Audit

**Commit:** pending  
**Date:** 2026-11-23

### Audit scope
Customer, Organizer, Scanner and POS screens from phases 22.1–22.7.

### Issues found and fixed
1. No auth guard on customer tabs — added token check, redirect to welcome if missing.
2. No auth guard on organizer stack — added organizer layout with the same check.
3. No navigation from customer profile to organizer tools — added link.

### Issues found, not fixed (documented)
1. API base URL is a placeholder (`https://dev.balkanevents.example`). Must be set via `EXPO_PUBLIC_API_URL` or `app.json` extra for a real device.
2. Scanner offline mode shows a warning but does not persist a queue for later sync.
3. 401 after failed refresh throws; individual screens must handle redirect (not centralized).
4. Ticket cards show id/code/status only. Event name and date are not returned by `/payments/my-tickets`.
5. POS uses ticket-type path only. Seat selection inside POS is not implemented.
6. No void sale UI, no previous sales list.
7. No image upload, no CSV guest import UI, no sound on scan, no device-token UI, no push, no wallet passes.
8. Seven customer tabs is crowded on small phones.
9. Camera and physical device flows are untested in this environment.

### API audit
- Auth: `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout` — used
- Discovery: `/events/discover`, `/events/search`, `/events/{slug}` — used
- Tickets: `/payments/my-tickets` — used
- Orders: `/orders/me` — used
- Preferences: `/me/preferences` — used
- Seat maps: `/seat-maps/event/{id}`, `/seat-maps/reserve` — used
- Organizer events: `/organizer/events` CRUD — used
- Guests: list, add, check-in — used
- POS: sales points, register open/close, sale — used
- Scanner: `/scanner/validate` — used
- All require backend RBAC; mobile does not bypass it

### Security
- Tokens only in SecureStore
- No tokens logged
- Backend remains authority for scan, reserve, sale and guest check-in
- Org and event isolation enforced by API
- Idempotency key on POS sale

### Tests
- `tsc --noEmit`: passed
- Backend suites already cover scanner, POS, seats, guests and permissions
- iOS/Android simulator: not run
- Physical device: not tested

### Real status
- Implemented: auth, discovery, tickets with QR, orders, preferences, seat reserve, organizer events, guests, scanner, POS cash sale
- Tested: TypeScript compile and backend integration tests
- Unverified: camera, offline sync, physical device, real API URL connectivity

### Constraints
Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe, no store submission.

---

## Phase 22.9 – API Connectivity & Device Testing

**Commit:** pending  
**Date:** 2026-11-23

### API configuration
- Placeholder `https://dev.balkanevents.example` removed as active default.
- `EXPO_PUBLIC_API_URL` is now required.
- `.env.example` documents local values:
  - `http://localhost:8000` for simulator on same host
  - `http://10.0.2.2:8000` for Android emulator
  - `http://<dev-machine-ip>:8000` for a physical device on the same LAN
- No production URL is used.
- No server was provisioned.

### Local backend status
- `docker-compose.yml` exists and can start Postgres 16, Redis and the API on port 8000.
- Docker is not available in this environment.
- Backend was not started here.
- To run locally: `docker compose up` then set `EXPO_PUBLIC_API_URL=http://localhost:8000`.

### Auth changes
- Failed refresh now clears SecureStore tokens.
- Existing guards on tabs and organizer then redirect to welcome.

### Test results
| Module | Result |
|---|---|
| TypeScript `tsc --noEmit` | passed |
| Login / register / refresh | not run — no backend |
| Discover / search / tickets / orders | not run — no backend |
| Seat reserve | not run — no backend |
| Organizer events / guests | not run — no backend |
| POS open / sale / close | not run — no backend |
| Scanner camera / VALID / ALREADY_USED | not run — no device, no backend |
| iOS simulator | not available |
| Android emulator | not available |
| Physical iPhone / Android | not available |

### Blockers
1. No running development API in this environment.
2. No iOS simulator, Android emulator or physical device.
3. CORS and HTTPS cannot be verified until a backend is reachable.

### Constraints
Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe, no store submission.

---

## Phase 22.10 – Feature Completion

**Commit:** pending  
**Date:** 2026-11-23

### Implemented
- POS void sale UI — `POST /pos/sale/{order_id}/void`
- Scanner offline queue — stores scans locally while offline, syncs via `POST /scanner/offline/sync`
- Offline scans labeled as not confirmed
- Vibration feedback on scan result
- CSV import endpoint documented on guest screen
- Ticket cards note that event name/date are not returned by `/payments/my-tickets`

### APIs used
- `POST /pos/sale/{order_id}/void`
- `POST /scanner/offline/sync`
- `GET /tickets/{id}/pdf` exists; in-app PDF render not added (no file-system share path)

### Blocked / not implemented
- Event name and date on ticket cards — `/payments/my-tickets` returns only id, code, qr_data, is_used
- In-app PDF view and share — endpoint exists, but no file-system/share flow
- POS previous sales list — no organizer list endpoint
- Seat selection inside POS — sale accepts seat_ids, but no mobile seat picker wired to POS yet
- Event image upload — no upload endpoint
- CSV file picker — import endpoint exists, `expo-document-picker` not installed
- Audio beep assets — vibration used instead

### Tests
- `tsc --noEmit`: passed
- Backend void, offline sync and PDF tests already exist
- Device/simulator: not run

### Constraints
Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe, no store submission.

---

## Phase 22.11 – Final Mobile Audit & Release Readiness

**Commit:** pending  
**Date:** 2026-11-23

### Scope
Phases 22.1–22.10. No new business features. One config fix: expo-camera plugin added for permission prompt.

### Screens (27)
- Auth: welcome, login, register, forgot
- Customer: home, discover, event detail, seats, tickets, orders, preferences, profile, settings
- Organizer: dashboard, events, create, edit, team, guests, POS, POS sale, scanner, scanners

### Feature status

| Feature | Status | Launch blocker? |
|---|---|---|
| Login / register / refresh | Implemented | Yes — needs running API |
| Discover / search | Implemented | Yes |
| Event detail | Implemented | Yes |
| Seat reserve | Implemented | No for first launch if web checkout used |
| Tickets + visual QR | Implemented | Yes |
| Event name/date on ticket | Not available from API | No — upgrade |
| In-app PDF | Endpoint exists, no viewer | No |
| Orders | Implemented | Yes |
| Organizer events CRUD | Implemented | No |
| Guest add / check-in | Implemented | No |
| CSV file picker | Endpoint exists, no picker | No |
| POS cash sale | Implemented | No |
| POS void | Implemented | No |
| POS sales history | No list endpoint | No |
| POS seat selection | Sale accepts seat_ids, no UI | No |
| Event image upload | No endpoint | No |
| Scanner camera | Implemented | No |
| Scanner sound | Vibration only | No |
| Offline sync | Implemented, not confirmed entry | No |
| Push / Wallet | Not implemented | No |

### Security
- Tokens only in SecureStore
- Guards on customer tabs and organizer stack
- Failed refresh clears tokens
- Backend RBAC is the authority
- POS sale sends idempotency key
- Offline scans never shown as confirmed
- No production URL

### Technical
- Expo SDK 52, React Native 0.76, TypeScript 5.6
- `tsc --noEmit`: passed
- iOS bundle: `org.balkanevents.app`
- Android package: `org.balkanevents.app`
- `EXPO_PUBLIC_API_URL` required
- expo-camera plugin added
- No icon asset yet
- No EAS build run

### Tests
- TypeScript: passed
- Backend suites for scanner, POS, seats, guests: exist and previously green
- iOS simulator: not available
- Android emulator: not available
- Physical device: not tested
- Live API: not reachable in this environment

### Readiness
- Technical: 7/10 — compiles, structure is sound, config gaps documented
- Functional: 6/10 — core flows wired, several polish items missing
- Security: 8/10 — backend authority, SecureStore, guards; device auth UI missing
- iOS: 4/10 — config present, never built or run
- Android: 4/10 — config present, never built or run
- Production: 2/10 — no real API URL, no device test, no store assets, no payments

### Blockers for a real device test
1. Running development API
2. `EXPO_PUBLIC_API_URL` set to that API
3. iOS simulator or Android emulator or physical device
4. App icon and splash assets

### Constraints
Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe, no store submission.
