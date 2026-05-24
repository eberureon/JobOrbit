JobOrbit is a self-hosted job application tracker built with TanStack Start, React, Drizzle, and SQLite.

# Getting Started

Install dependencies and start the dev server:

```bash
bun install
bun --bun run dev
```

# Building For Production

```bash
bun --bun run build
```

## Running With Docker

```bash
docker compose up -d
```

The app listens on port `3000` inside the container. Configure the host port in `.env`.

## Environment Variables

- `PORT` - host port for Docker compose (defaults to `3000`)
- `DATABASE_URL` - SQLite path (defaults to `./data/joborbit.db`)
- `TZ` - container timezone (defaults to `Etc/UTC`)

## Testing

```bash
bun --bun run test
```

## Linting & Formatting

```bash
bun --bun run lint
bun --bun run format
bun --bun run check
```
