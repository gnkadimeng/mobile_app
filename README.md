# CHIETA Mobile App

Expo / React Native app for CHIETA — login, grant dashboards (GM & IM portals), organisation data, and document access. Talks to the [CHIETA Backend API](https://github.com/cktshukudu/backend_api).

## Architecture

```
Mobile app (Expo) ──HTTPS──► https://ssdd.chieta.org.za/mobile-api ──► backend ──► PostgreSQL
```

- **Frontend only** — all data comes from the backend API. No business logic or secrets live in the app.
- **Auth:** the app logs in, receives a **JWT**, stores it, and sends it as `Authorization: Bearer <token>` on every request (see [`authToken.js`](authToken.js)).

## API configuration

The API base URL resolves in one place — [`config.js`](config.js):

1. **`EXPO_PUBLIC_API_URL`** (env) always wins — set it for deploys, staging, or CI.
2. Otherwise: `PRODUCTION` in a build, `DEVELOPMENT` (`http://localhost:5000`) in dev.

```bash
# point the app at any backend without code changes (put it in a .env file
# so Expo inlines it at build time)
echo "EXPO_PUBLIC_API_URL=https://ssdd.chieta.org.za/mobile-api" > .env
```

> When you change the env, rebuild with `--clear` so Metro re-inlines it:
> `npx expo export --platform web --output-dir dist --clear`

Every endpoint, request/response shape, and the auth flow are documented in the backend's **Swagger UI**: `https://ssdd.chieta.org.za/mobile-api/api-docs/`.

## Run locally

```bash
npm install

# web (quickest to click through)
npx expo start --web

# native (needs Android Studio / Xcode — this is a bare workflow, not Expo Go)
npx expo run:android
npx expo run:ios
```

Log in with a backend account; the app then shows the portal selection (IMS / GMS).

## Build & distribute

```bash
# Android release APK
cd android && ./gradlew assembleRelease
```

Set `EXPO_PUBLIC_API_URL` (via `.env`) to the target backend before building, then distribute the signed APK to staff (MDM / sideload).

## Tests

```bash
npm run test:e2e     # Playwright: login → portal flow (see e2e/)
```

CI (`.github/workflows/ci.yml`) lints, builds the web bundle, and runs a full-stack Playwright E2E (spins up the backend + a seeded Postgres, then drives the app).

## Project layout

| Path | What |
|---|---|
| `app/` | Expo Router entry |
| `components/` | Screens (Login, Home, dashboards, …) |
| `config.js` | API base URL + endpoint definitions |
| `authToken.js` | JWT storage + axios auth header |
| `e2e/` | Playwright end-to-end tests |

## Notes

- Don't hardcode API hosts in screens — route everything through `config.js`.
- Never commit secrets or `.env`.
