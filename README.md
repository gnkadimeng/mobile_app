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

> **Node version is pinned to 20** (see [`.nvmrc`](.nvmrc)). `engine-strict` is on,
> so npm refuses to install on any other major — this is what stops a mismatched
> Node from committing a `package-lock.json` that CI then rejects. Run `nvm use`
> first, or use the Docker path below.

## Run locally

```bash
nvm use          # Node 20, per .nvmrc
npm install

# web (quickest to click through)
npx expo start --web

# native (needs Android Studio / Xcode — this is a bare workflow, not Expo Go)
npx expo run:android
npx expo run:ios
```

Log in with a backend account; the app then shows the portal selection (IMS / GMS).

## Reproducible builds (Docker)

The **web** build and the full-stack **E2E** stack run in containers so they
behave identically on every machine and in CI — no local Node/Postgres setup.

```bash
# just the web bundle (deterministic; same Node as CI)
docker build --build-arg EXPO_PUBLIC_API_URL=https://ssdd.chieta.org.za/mobile-api -t chieta-web .

# full stack for E2E: Postgres + backend + web, mirroring CI
git clone https://github.com/cktshukudu/backend_api ../backend_api   # sibling checkout
docker compose up --build
BASE_URL=http://localhost:19010 E2E_EMAIL=test@chieta.test E2E_PW='Test1234!' npx playwright test
docker compose down -v
```

> **iOS/Android native builds cannot run in Docker** (Xcode/CocoaPods are macOS-only).
> Use EAS Build below — that is the reproducible-environment answer for native.

## Native builds (EAS)

Native `.ipa`/`.apk` are built on Expo's managed builders per [`eas.json`](eas.json),
so nobody hand-runs `pod install` / Gradle on their own machine.

```bash
npm i -g eas-cli
eas login
eas build -p ios --profile preview      # internal build (simulator)
eas build -p android --profile preview   # internal APK
eas build --profile production           # store builds
```

The API each profile targets is set via `EXPO_PUBLIC_API_URL` in `eas.json`.

### Local Android APK (alternative)

```bash
# needs Android SDK locally
cd android && ./gradlew assembleRelease
```

Set `EXPO_PUBLIC_API_URL` (via `.env`) before building, then distribute the signed APK to staff (MDM / sideload).

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
