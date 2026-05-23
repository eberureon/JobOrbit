<!-- intent-skills:start -->
## Skill Loading

Before substantial work:
- Skill check: run `bunx @tanstack/intent@latest list`, or use skills already listed in context.
- Skill guidance: if one local skill clearly matches the task, run `bunx @tanstack/intent@latest load <package>#<skill>` and follow the returned `SKILL.md`.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

## Repo Quick Facts
- Single-package repo: `client/` (Vite React), `server/` (Express), `shared/` (Drizzle schema + Zod types).
- Dev server runs via `npm run dev` and serves both API and client on `http://localhost:5000` (from `PORT`).
- Production build uses `npm run build`, then `npm start` (serves `dist/public` + API).
- Typecheck is `npm run check` (tsc).
- Database is SQLite at `./data.db` by default; override with `DATA_DIR` or `DATABASE_FILE`.
- Drizzle schema source is `shared/schema.ts`; `npm run db:push` uses `drizzle.config.ts` and writes to `./data.db`.

## Tooling Quirks
- If running shell commands via CLI, prefix them with `rtk` per `.github/copilot-instructions.md`.
