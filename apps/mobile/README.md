# BALKAN EVENTS mobile

Expo SDK 52, React Native 0.76, Expo Router 4, TypeScript.

## API URL

Set in `app.json` under `expo.extra.apiUrl`, or via `EXPO_PUBLIC_API_URL`.

Do not use localhost for a physical iPhone. Point to the development server URL.

## Scripts

- `npm start` — Expo dev server
- `npm run typecheck` — TypeScript

## Auth

Tokens are stored in Expo SecureStore. Never logged. Refresh is single-flight.
