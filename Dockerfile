# Reproducible web build — same Node the CI runners use (see .nvmrc).
# Building the app the same way everywhere is what removes "works on my machine"
# lockfile drift. Note: this builds the WEB bundle only. iOS/Android native
# builds cannot run in Docker (Xcode/CocoaPods are macOS-only) — use EAS Build
# (see eas.json) for those.

# ---- build stage -------------------------------------------------------------
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Install with the committed lock; `npm ci` fails loudly if the lock drifts.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# The API the built app talks to is baked in at export time via a .env file
# (EXPO_PUBLIC_* are inlined by Metro). Override with --build-arg.
ARG EXPO_PUBLIC_API_URL=https://ssdd.chieta.org.za/mobile-api
RUN echo "EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}" > .env \
 && npx expo export --platform web --output-dir dist

# ---- serve stage -------------------------------------------------------------
FROM node:20-bookworm-slim AS serve
WORKDIR /app
RUN npm i -g serve@14
COPY --from=build /app/dist ./dist
EXPOSE 19010
CMD ["serve", "-s", "dist", "-l", "19010"]
