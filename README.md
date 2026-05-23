# JobOrbit — Self-Hosted Job Application Tracker

A private, self-hosted, single-user job application tracker. Track applications, monitor your pipeline funnel, and manage your CV — all in one open-source app. Your data lives on your machine in a single SQLite file.

![JobOrbit dashboard preview](./screenshot.png)

## Features

- **Dashboard** — Total/7-day/30-day counts, status breakdown donut, applications-over-time chart, success-rate funnel with percentages, top companies, and a recent applications list.
- **Applications** — Full CRUD list with search, multi-select status filters, sorting, and a rich create/edit dialog (company, role, location, status, applied date, salary, source, job URL, notes).
- **CV** — Single-page CV editor with live preview and one-click Markdown export.
- **Dark techy UI** — Restrained dark theme inspired by Linear / Vercel, with monospace numerals, hairline gradient borders, and subtle dot-grid accents.
- **Self-hosted & private** — No accounts, no telemetry, no cloud. Just run it locally.
- **Single-file storage** — Drizzle ORM + SQLite (better-sqlite3). Back up `data.db` to back up everything.

## Tech Stack

- **Frontend:** React 18 · Vite · Tailwind CSS v3 · shadcn/ui · Recharts · wouter (hash routing) · TanStack Query
- **Backend:** Node.js · Express 5
- **Database:** SQLite via `better-sqlite3` + Drizzle ORM
- **Validation:** Zod + drizzle-zod
- **Forms:** react-hook-form + zod resolvers

## Getting Started

Requirements: Node.js 20+ and bun.

```bash
git clone <this-repo>
cd joborbit
npm install
npm run dev
```

The app starts on **http://localhost:5000**. Open in your browser. Tables are auto-created on first run.

## Production

```bash
npm run build
npm start          # NODE_ENV=production node dist/index.cjs
```

Static frontend bundles live in `dist/public`. The server listens on port 5000 by default.

## Docker (recommended for self-hosting)

A production-ready `Dockerfile` and `docker-compose.yml` are included.

```bash
cp .env.example .env       # optional — adjust PORT and TZ
docker compose up -d       # build image and start in background
docker compose logs -f     # follow logs
```

Then open **http://localhost:3000** (change `PORT` in `.env` to use a different host port).

**What you get out of the box:**

- Multi-stage build → small runtime image (~150 MB), only production deps included.
- Runs as the non-root `node` user with `no-new-privileges`, dropped capabilities, and a read-only root filesystem (`/tmp` mounted as tmpfs).
- Data persists in the named Docker volume **`job-tracker-data`** (mounted at `/data` inside the container).
- Container `HEALTHCHECK` hits `/api/health` every 30 seconds.
- Bound to `127.0.0.1` by default — edit the `ports` mapping in `docker-compose.yml` if you want LAN/WAN access (put it behind a reverse proxy like Caddy or Traefik for TLS).
- Resource limits: 1 CPU, 512 MB RAM. JSON log rotation at 10 MB × 3 files.
- `restart: unless-stopped` so it survives reboots.

**Common commands:**

```bash
docker compose up -d --build       # rebuild after pulling code changes
docker compose down                # stop (data is preserved)
docker compose down -v             # stop AND delete the data volume (destructive)
docker volume inspect job-tracker-data    # find the volume on the host
```

**Backup the database:**

```bash
docker run --rm -v job-tracker-data:/data -v "$PWD":/backup alpine \
  tar czf /backup/job-tracker-backup-$(date +%F).tar.gz -C /data .
```

**Restore:**

```bash
docker run --rm -v job-tracker-data:/data -v "$PWD":/backup alpine \
  sh -c "cd /data && tar xzf /backup/job-tracker-backup-YYYY-MM-DD.tar.gz"
```

## Data

All data is stored in a single SQLite file. By default it's **`data.db`** at the project root (with `data.db-wal` and `data.db-shm` companion files due to WAL journaling).

Under Docker the file lives at `/data/data.db` inside the container, persisted in the `job-tracker-data` volume.

The location is configurable via environment variables:

- `DATA_DIR` — directory the database file lives in (default: project root, `/data` in Docker).
- `DATABASE_FILE` — full path override; takes precedence over `DATA_DIR`.

To back up: copy the `data.db` file. To reset: delete it and restart the server.

The schema is auto-created on startup — no migrations needed for self-hosters. To inspect the schema, see `shared/schema.ts`.

## API

The backend exposes a simple JSON REST API:

| Method | Path                    | Description                         |
| ------ | ----------------------- | ----------------------------------- |
| GET    | `/api/applications`     | List all applications               |
| POST   | `/api/applications`     | Create application                  |
| GET    | `/api/applications/:id` | Get one application                 |
| PATCH  | `/api/applications/:id` | Update application                  |
| DELETE | `/api/applications/:id` | Delete application                  |
| GET    | `/api/stats`            | Dashboard stats (counts, funnel, …) |
| GET    | `/api/cv`               | Get CV (singleton, auto-created)    |
| PUT    | `/api/cv`               | Upsert CV                           |
| GET    | `/api/health`           | Healthcheck (used by Docker)        |

## Project Structure

```
job-tracker/
├── client/                 # Vite + React frontend
│   └── src/
│       ├── pages/          # Dashboard, Applications, CV, NotFound
│       ├── components/     # Sidebar, Logo, StatusBadge, shadcn ui/
│       └── lib/queryClient.ts
├── server/                 # Express backend
│   ├── index.ts            # entry point
│   ├── routes.ts           # API routes
│   └── storage.ts          # Drizzle SQLite storage
├── shared/
│   └── schema.ts           # Drizzle tables + Zod schemas + types
└── data.db                 # SQLite (created at first run)
```

## License

MIT — see [LICENSE](./LICENSE). Use it, fork it, host it on your own server.

---

Built as a self-hosted, single-user tool. No analytics, no third-party calls. Your job search stays yours.
