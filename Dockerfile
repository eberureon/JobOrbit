# syntax=docker/dockerfile:1.7

# ---------- Stage 1: deps ----------
# Install all dependencies (including dev) needed to build the app.
FROM oven/bun:1 AS deps
WORKDIR /app

# Build tools required to compile better-sqlite3 from source.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile


# ---------- Stage 2: build ----------
# Build the app (Vite + TanStack Start SSR) into .output/.
FROM deps AS build
WORKDIR /app
COPY . .
RUN bun --bun run build


# ---------- Stage 3: runtime ----------
# Minimal production image. Only production deps + built artifacts.
FROM oven/bun:1-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_URL=/app/data/joborbit.db

# Install production deps only (better-sqlite3 prebuilds work on debian-slim).
# Build toolchain stays here in case prebuilds aren't available for the arch.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates wget \
 && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production \
 && apt-get purge -y python3 make g++ \
 && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*

# Copy built output from the build stage.
COPY --from=build /app/.output ./.output

# Create data dir and run as the non-root user.
RUN mkdir -p /app/data && chown -R bun:bun /app/data /app
USER bun

EXPOSE 3000
VOLUME ["/app/data"]

# Healthcheck hits the server.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1 || exit 1

CMD ["bun", "run", "srvx"]
