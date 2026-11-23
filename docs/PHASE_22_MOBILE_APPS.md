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
