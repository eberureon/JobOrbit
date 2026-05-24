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
# Build the app (Vite + TanStack Start SSR) into dist/.
FROM deps AS build
WORKDIR /app
COPY . .
RUN bun --bun run build

# ---------- Stage 3: prod deps ----------
# Install production dependencies with Bun on Node libc.
FROM node:lts-slim AS prod-deps
WORKDIR /app

# Build tools required to compile better-sqlite3 from source.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates curl unzip \
  && rm -rf /var/lib/apt/lists/*

# Install Bun for lockfile-compatible installs.
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# ---------- Stage 4: runtime ----------
# Minimal production image running srvx on Node.js.
FROM node:lts-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
  PORT=3000 \
  HOST=0.0.0.0 \
  DATABASE_URL=/app/data/joborbit.db

COPY package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built output and migrations from the build stage.
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./dist/drizzle

# Create data dir and run as the non-root user.
RUN mkdir -p /app/data && chown -R node:node /app
USER node

EXPOSE 3000
VOLUME ["/app/data"]

CMD ["node", "./node_modules/.bin/srvx", "--prod", "-s", "../client", "dist/server/server.js"]
