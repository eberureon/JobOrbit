<!-- intent-skills:start -->
# Skill mappings - load `use` with `bunx @tanstack/intent@latest load <use>`.
skills:
  - when: "Install TanStack Devtools, pick framework adapter (React/Vue/Solid/Preact), register plugins via plugins prop, configure shell (position, hotkeys, theme, hideUntilHover, requireUrlFlag, eventBusConfig). TanStackDevtools component, defaultOpen, localStorage persistence."
    use: "@tanstack/devtools#devtools-app-setup"
  - when: "Publish plugin to npm and submit to TanStack Devtools Marketplace. PluginMetadata registry format, plugin-registry.ts, pluginImport (importName, type), requires (packageName, minVersion), framework tagging, multi-framework submissions, featured plugins."
    use: "@tanstack/devtools#devtools-marketplace"
  - when: "Build devtools panel components that display emitted event data. Listen via EventClient.on(), handle theme (light/dark), use @tanstack/devtools-ui components. Plugin registration (name, render, id, defaultOpen), lifecycle (mount, activate, destroy), max 3 active plugins. Two paths: Solid.js core with devtools-ui for multi-framework support, or framework-specific panels."
    use: "@tanstack/devtools#devtools-plugin-panel"
  - when: "Handle devtools in production vs development. removeDevtoolsOnBuild, devDependency vs regular dependency, conditional imports, NoOp plugin variants for tree-shaking, non-Vite production exclusion patterns."
    use: "@tanstack/devtools#devtools-production"
  - when: "Two-way event patterns between devtools panel and application. App-to-devtools observation, devtools-to-app commands, time-travel debugging with snapshots and revert. structuredClone for snapshot safety, distinct event suffixes for observation vs commands, serializable payloads only."
    use: "@tanstack/devtools-event-client#devtools-bidirectional"
  - when: "Create typed EventClient for a library. Define event maps with typed payloads, pluginId auto-prepend namespacing, emit()/on()/onAll()/onAllPluginEvents() API. Connection lifecycle (5 retries, 300ms), event queuing, enabled/disabled state, SSR fallbacks, singleton pattern. Unique pluginId requirement to avoid event collisions."
    use: "@tanstack/devtools-event-client#devtools-event-client"
  - when: "Analyze library codebase for critical architecture and debugging points, add strategic event emissions. Identify middleware boundaries, state transitions, lifecycle hooks. Consolidate events (1 not 15), debounce high-frequency updates, DRY shared payload fields, guard emit() for production. Transparent server/client event bridging."
    use: "@tanstack/devtools-event-client#devtools-instrumentation"
  - when: "Configure @tanstack/devtools-vite for source inspection (data-tsd-source, inspectHotkey, ignore patterns), console piping (client-to-server, server-to-client, levels), enhanced logging, server event bus (port, host, HTTPS), production stripping (removeDevtoolsOnBuild), editor integration (launch-editor, custom editor.open). Must be FIRST plugin in Vite config. Vite ^6 || ^7 only."
    use: "@tanstack/devtools-vite#devtools-vite-plugin"
  - when: "Step-by-step migration from Next.js App Router to TanStack Start: route definition conversion, API mapping, server function conversion from Server Actions, middleware conversion, data fetching pattern changes."
    use: "@tanstack/react-start#lifecycle/migrate-from-nextjs"
  - when: "React bindings for TanStack Start: createStart, StartClient, StartServer, React-specific imports, re-exports from @tanstack/react-router, full project setup with React, useServerFn hook."
    use: "@tanstack/react-start#react-start"
  - when: "Implement, review, debug, and refactor TanStack Start React Server Components in React 19 apps. Use when tasks mention @tanstack/react-start/rsc, renderServerComponent, createCompositeComponent, CompositeComponent, renderToReadableStream, createFromReadableStream, createFromFetch, Composite Components, React Flight streams, loader or query owned RSC caching, router.invalidate, structuralSharing: false, selective SSR, stale names like renderRsc or .validator, or migration from Next App Router RSC patterns. Do not use for generic SSR or non-TanStack RSC frameworks except brief comparison."
    use: "@tanstack/react-start#react-start/server-components"
  - when: "Framework-agnostic core concepts for TanStack Router: route trees, createRouter, createRoute, createRootRoute, createRootRouteWithContext, addChildren, Register type declaration, route matching, route sorting, file naming conventions. Entry point for all router skills."
    use: "@tanstack/router-core#router-core"
  - when: "Route protection with beforeLoad, redirect()/throw redirect(), isRedirect helper, authenticated layout routes (_authenticated), non-redirect auth (inline login), RBAC with roles and permissions, auth provider integration (Auth0, Clerk, Supabase), router context for auth state."
    use: "@tanstack/router-core#router-core/auth-and-guards"
  - when: "Automatic code splitting (autoCodeSplitting), .lazy.tsx convention, createLazyFileRoute, createLazyRoute, lazyRouteComponent, getRouteApi for typed hooks in split files, codeSplitGroupings per-route override, splitBehavior programmatic config, critical vs non-critical properties."
    use: "@tanstack/router-core#router-core/code-splitting"
  - when: "Route loader option, loaderDeps for cache keys, staleTime/gcTime/ defaultPreloadStaleTime SWR caching, pendingComponent/pendingMs/ pendingMinMs, errorComponent/onError/onCatch, beforeLoad, router context and createRootRouteWithContext DI pattern, router.invalidate, Await component, deferred data loading with unawaited promises."
    use: "@tanstack/router-core#router-core/data-loading"
  - when: "Link component, useNavigate, Navigate component, router.navigate, ToOptions/NavigateOptions/LinkOptions, from/to relative navigation, activeOptions/activeProps, preloading (intent/viewport/render), preloadDelay, navigation blocking (useBlocker, Block), createLink, linkOptions helper, scroll restoration, MatchRoute."
    use: "@tanstack/router-core#router-core/navigation"
  - when: "notFound() function, notFoundComponent, defaultNotFoundComponent, notFoundMode (fuzzy/root), errorComponent, CatchBoundary, CatchNotFound, isNotFound, NotFoundRoute (deprecated), route masking (mask option, createRouteMask, unmaskOnReload)."
    use: "@tanstack/router-core#router-core/not-found-and-errors"
  - when: "Dynamic path segments ($paramName), splat routes ($ / _splat), optional params ({-$paramName}), prefix/suffix patterns ({$param}.ext), useParams, params.parse/stringify, pathParamsAllowedCharacters, i18n locale patterns."
    use: "@tanstack/router-core#router-core/path-params"
  - when: "validateSearch, search param validation with Zod/Valibot/ArkType adapters, fallback(), search middlewares (retainSearchParams, stripSearchParams), custom serialization (parseSearch, stringifySearch), search param inheritance, loaderDeps for cache keys, reading and writing search params."
    use: "@tanstack/router-core#router-core/search-params"
  - when: "Non-streaming and streaming SSR, RouterClient/RouterServer, renderRouterToString/renderRouterToStream, createRequestHandler, defaultRenderHandler/defaultStreamHandler, HeadContent/Scripts components, head route option (meta/links/styles/scripts), ScriptOnce, automatic loader dehydration/hydration, memory history on server, data serialization, document head management."
    use: "@tanstack/router-core#router-core/ssr"
  - when: "Full type inference philosophy (never cast, never annotate inferred values), Register module declaration, from narrowing on hooks and Link, strict:false for shared components, getRouteApi for code-split typed access, addChildren with object syntax for TS perf, LinkProps and ValidateLinkOptions type utilities, as const satisfies pattern."
    use: "@tanstack/router-core#router-core/type-safety"
  - when: "TanStack Router bundler plugin for route generation and automatic code splitting. Supports Vite, Webpack, Rspack, and esbuild. Configures autoCodeSplitting, routesDirectory, target framework, and code split groupings."
    use: "@tanstack/router-plugin#router-plugin"
  - when: "Core overview for TanStack Start: tanstackStart() Vite plugin, getRouter() factory, root route document shell (HeadContent, Scripts, Outlet), client/server entry points, routeTree.gen.ts, tsconfig configuration. Entry point for all Start skills."
    use: "@tanstack/start-client-core#start-core"
  - when: "Server-side authentication primitives for TanStack Start: session cookies (HttpOnly, Secure, SameSite, __Host- prefix), session read/issue/destroy via createServerFn and middleware, OAuth authorization-code flow with state and PKCE, password-reset enumeration defense, CSRF for non-GET RPCs, rate limiting auth endpoints, session rotation on privilege change. Pairs with router-core/auth-and-guards for the routing side."
    use: "@tanstack/start-client-core#start-core/auth-server-primitives"
  - when: "Deploy to Cloudflare Workers, Netlify, Vercel, Node.js/Docker, Bun, Railway. Selective SSR (ssr option per route), SPA mode, static prerendering, ISR with Cache-Control headers, SEO and head management."
    use: "@tanstack/start-client-core#start-core/deployment"
  - when: "Isomorphic-by-default principle, environment boundary functions (createServerFn, createServerOnlyFn, createClientOnlyFn, createIsomorphicFn), ClientOnly component, useHydrated hook, import protection, dead code elimination, environment variable safety (VITE_ prefix, process.env)."
    use: "@tanstack/start-client-core#start-core/execution-model"
  - when: "createMiddleware, request middleware (.server only), server function middleware (.client + .server), context passing via next({ context }), sendContext for client-server transfer, global middleware via createStart in src/start.ts, middleware factories, method order enforcement, fetch override precedence."
    use: "@tanstack/start-client-core#start-core/middleware"
  - when: "createServerFn (GET/POST), inputValidator (Zod or function), useServerFn hook, server context utilities (getRequest, getRequestHeader, setResponseHeader, setResponseStatus), error handling (throw errors, redirect, notFound), streaming, FormData handling, file organization (.functions.ts, .server.ts)."
    use: "@tanstack/start-client-core#start-core/server-functions"
  - when: "Server-side API endpoints using the server property on createFileRoute, HTTP method handlers (GET, POST, PUT, DELETE), createHandlers for per-handler middleware, handler context (request, params, context), request body parsing, response helpers, file naming for API routes."
    use: "@tanstack/start-client-core#start-core/server-routes"
  - when: "Server-side runtime for TanStack Start: createStartHandler, request/response utilities (getRequest, setResponseHeader, setCookie, getCookie, useSession), three-phase request handling, AsyncLocalStorage context."
    use: "@tanstack/start-server-core#start-server-core"
  - when: "Programmatic route tree building as an alternative to filesystem conventions: rootRoute, index, route, layout, physical, defineVirtualSubtreeConfig. Use with TanStack Router plugin's virtualRouteConfig option."
    use: "@tanstack/virtual-file-routes#virtual-file-routes"
  - when: "Load environment variables from a .env file into process.env for Node.js applications. Use when configuring apps with secrets, setting up local development environments, managing API keys and database uRLs, parsing .env file contents, or populating environment variables programmatically. Always use this skill when the user mentions .env, even for simple tasks like \"set up dotenv\" — the skill contains critical gotchas (encrypted keys, variable expansion, command substitution) that prevent common production issues."
    use: "dotenv#dotenv"
  - when: "Use dotenvx to run commands with environment variables, manage multiple .env files, expand variables, and encrypt env files for safe commits and CI/CD."
    use: "dotenv#dotenvx"
<!-- intent-skills:end -->

## Migration Context
- Legacy app moved to `legacy/` (do not edit in place; migrate into `src/` routes).
- TanStack Start scaffold command used: `npx @tanstack/cli@latest create my-tanstack-app --agent --package-manager bun --toolchain biome --add-ons neon,drizzle,sentry,better-auth,tanstack-query,table,form`.
- Intent setup commands run: `npx @tanstack/intent@latest install --map`, then `npx @tanstack/intent@latest list`.
- Stack choices to preserve: TanStack Start + Router + Query + Table + Form + Better Auth + Drizzle + Biome.
- Env vars (see `.env.local`, `.env.example`): `DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`.
- Tooling quirk: prefix shell commands with `rtk` per `.github/copilot-instructions.md`.
- UI: shadcn/ui primitives copied from legacy into `src/components/ui/` (Button, Input, Textarea, Label, Card, Dialog, AlertDialog, Select, DropdownMenu, Form, Toast, Separator, Alert, Badge, Table) + `src/hooks/use-toast.ts`.
- CSS: shadcn HSL CSS vars merged into `src/styles.css` (light + dark modes via `:root` / `:root[data-theme="dark"]` / `@media (prefers-color-scheme: dark)`). Tailwind v4 `@theme` entries for color classes (`bg-card`, `text-muted-foreground`, etc.). Status badge colors, elevation/hover utilities added.
- Migrated routes: `/` (Dashboard with stats/charts), `/applications` (full CRUD with search/filter/sort/dialog).
- Server functions: `src/lib/server/applications.functions.ts` (list/get/create/update/delete/stats), `src/lib/server/resume.functions.ts` (get/upsert).
- Database: SQLite via `better-sqlite3` + `drizzle-orm/better-sqlite3`. Tables auto-create on startup via `CREATE TABLE IF NOT EXISTS` in `src/db/index.ts`. DB file lives at `./data/joborbit.db` (configurable via `DATABASE_URL` in `.env.local`, defaults to `./data/joborbit.db`).
- Removed PostgreSQL/Neon migration: switched from `pgTable`/`serial` to `sqliteTable`/`integer` with autoIncrement. Deleted `neon-vite-plugin.ts`, `src/db.ts`, removed `@neondatabase/serverless`, `pg`, `@types/pg`, `vite-plugin-neon-new`. Drizzle Kit dialect set to `sqlite`.
- SQLite API patterns: use `.all()` for list queries, `.get()` for single-row, `.run()` for delete, `.returning().get()` for insert/update (supported by drizzle-orm + better-sqlite3).
- Build verified: `bun --bun run build` compiles successfully (client + SSR).

## TDD Progress

### Structure
- **Pure functions**: `src/lib/stats.ts` (computeStats), `src/lib/stats.test.ts`
- **Raw CRUD** (bypasses createServerFn): `src/lib/db/applications.ts`, `src/lib/db/applications.test.ts`
- **Route components**: `src/routes/-index.test.tsx` (Dashboard), `src/routes/-applications.test.tsx` (pending)
- **Shared types**: `src/types.ts` (APPLICATION_STATUSES, ApplicationStatus, Stats)
- **Test infra**: `src/test/setup.ts` (in-memory SQLite), `src/test/test-utils.tsx` (QueryClientProvider wrapper)

### Patterns
- Raw CRUD extracted from createServerFn wrappers so DB logic is testable in node without TanStack Start runtime
- Component tests mock server functions via `vi.hoisted` + `vi.mock`, wrap with `QueryClientProvider` (retry: false)
- Use `findAllByText` with `length >= 1` to handle React 19 StrictMode double-renders in jsdom
- Test files prefixed `-` to exclude from TanStack Router route scanning (`routeFileIgnorePrefix: "-"`)
- In-memory SQLite (`DATABASE_URL=:memory:`) with `afterEach` table truncation

### Test Suite (34 tests, all passing)
| File | Tests | Status |
|------|-------|--------|
| `src/lib/stats.test.ts` | 6 | PASS |
| `src/lib/db/applications.test.ts` | 10 | PASS |
| `src/routes/-index.test.tsx` | 5 | PASS |
| `src/routes/-applications.test.tsx` | 13 | PASS |

### Relevant Files
- `src/lib/stats.ts` — pure computeStats function
- `src/lib/stats.test.ts` — 6 tests (empty, counts, breakdown, funnel, timeline, top companies)
- `src/lib/db/applications.ts` — raw CRUD (listAll, getById, insert, update, remove, stats)
- `src/lib/db/applications.test.ts` — 10 tests (ordering, partial update, validation, nonexistent IDs)
- `src/lib/server/applications.functions.ts` — createServerFn wrappers delegating to db/applications.ts
- `src/routes/-index.test.tsx` — 5 tests (title, stat cards, funnel, top companies, recent apps) — imports `DashboardPage` from components
- `src/routes/-applications.test.tsx` — 13 tests (title, counts, empty state, table render, badges, edit/delete buttons, sort buttons, no-match filter, dialog open from edit/add) — imports `ApplicationsPage` from components
- `src/components/pages/applications/ApplicationDialog.tsx` — extracted from 696-line route, props `open`/`onOpenChange`/`editing`
- `src/components/pages/applications/ApplicationsPage.tsx` — full applications page component (moved out of route file)
- `src/components/pages/applications/index.ts` — barrel export (ApplicationDialog, ApplicationsPage)
- `src/components/pages/dashboard/DashboardPage.tsx` — full dashboard component (moved out of route file)
- `src/components/pages/dashboard/index.ts` — barrel export (DashboardPage)
- Route files (`src/routes/index.tsx`, `src/routes/applications.tsx`) are thin — only route definition + component import, no exports other than `Route`
- `src/test/setup.ts` — DATABASE_URL=:memory:, afterEach truncation
- `src/test/test-utils.tsx` — QueryClientProvider (retry: false)
- `src/types.ts` — shared domain types
- `src/db/schema.ts` — drizzle schema, re-exports types
- `src/components/StatusBadge.tsx` — imports ApplicationStatus from types.ts

## Agent skills

### Issue tracker

Issues are tracked on GitHub. See `docs/agents/issue-tracker.md`.

### Triage labels

Default labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo. See `docs/agents/domain.md`.
