# syntax=docker/dockerfile:1.7

# ---------- Stage 1: deps ----------
# Install all dependencies (including dev) needed to build the app.
FROM node:20-bookworm-slim AS deps
WORKDIR /app

# Build tools required to compile better-sqlite3 from source.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund


# ---------- Stage 2: build ----------
# Build the client (Vite) and bundle the server (esbuild) into /app/dist.
FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build


# ---------- Stage 3: runtime ----------
# Minimal production image. Only production deps + built artifacts.
FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=5000 \
    DATA_DIR=/data

# Install production deps only (better-sqlite3 prebuilds work on debian-slim).
# Build toolchain stays here in case prebuilds aren't available for the arch.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates wget \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --no-audit --no-fund \
 && apt-get purge -y python3 make g++ \
 && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*

# Copy built output from the build stage.
COPY --from=build /app/dist ./dist

# Create data dir and run as the non-root `node` user that ships with the image.
RUN mkdir -p /data && chown -R node:node /data /app
USER node

EXPOSE 5000
VOLUME ["/data"]

# Healthcheck hits the API health endpoint inside the container.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/api/health >/dev/null 2>&1 || exit 1

CMD ["node", "dist/index.cjs"]
