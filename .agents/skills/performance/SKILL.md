---
name: performance
description: Full-stack web performance optimization including Lighthouse audits, Core Web Vitals, bundle analysis, code splitting, lazy loading, image/font optimization, DB query tuning, API latency reduction, SSR optimization, caching strategies, CDN/edge placement, framework-specific patterns (React, TanStack Query, TanStack Router), and WCAG A accessibility compliance for Germany (BITV/EN 301 549). Use when user says "make it faster", "slow page", "performance", "Lighthouse", "Core Web Vitals", "bundle size", "optimize", "render", "caching", "lazy load", "code split", "accessibility", "a11y", "WCAG", or reports performance regressions.
---

# Performance

## Quick start

1. **Profile first** — never optimize blind. Run Lighthouse, capture a performance trace, check bundle analysis, identify the bottleneck.
2. **Fix the biggest win** — address the highest-impact issue (largest file, slowest query, most re-renders).
3. **Verify improvement** — re-profile after each change. If no measurable gain, revert.

## Workflows

### Measure before optimizing

- **Lighthouse**: use `chrome-devtools_lighthouse_audit` (snapshot for current state, navigation for load perf).
- **Performance trace**: use `chrome-devtools_performance_start_trace` (reload + autoStop) to capture load/ interaction timeline.
- **Bundle analysis**: run `bunx vite-bundle-visualizer` or `npx source-map-explorer dist/client/assets/*.js`.
- **Network waterfall**: use `chrome-devtools_list_network_requests` to spot large assets, render-blocking resources, slow API calls.
- **Memory**: use `chrome-devtools_take_memory_snapshot` to find leaks in repeated interactions.

### Frontend loading

| Issue                             | Fix                                                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------------------- |
| Large JS bundles                  | Code-split routes (`autoCodeSplitting` in TanStack Router), dynamic `import()` for heavy components |
| Render-blocking CSS               | Inline critical CSS, defer non-critical with `media="print" onload="this.media='all'"`              |
| Unoptimized images                | Add `loading="lazy"`, use `<picture>` with WebP/AVIF, set explicit `width`/`height`                 |
| Custom fonts causing layout shift | Use `font-display: swap` or `optional`, preconnect to font origin, subset fonts                     |
| Too many HTTP requests            | Bundle where possible, use HTTP/2, preconnect to critical origins                                   |
| No caching headers                | Set `Cache-Control: public, max-age=31536000, immutable` on fingerprinted assets                    |

### Frontend runtime

- **Reduce re-renders**: `React.memo` for pure components receiving unchanged props, `useMemo`/`useCallback` for expensive computations and stable callbacks, move state down.
- **TanStack Query tuning**: set `staleTime` > 0 to avoid refetching data that changes infrequently (e.g. `staleTime: 5 * 60 * 1000` for reference data), use `gcTime` to keep data in cache across navigation, enable `prefetch` on route hover via `router.preloadRoute()`.
- **TanStack Router code-splitting**: enable `autoCodeSplitting: true` in the router plugin, use `.lazy.tsx` route files so route components load on demand.
- **Virtualize long lists**: replace mapped lists with `@tanstack/react-virtual` for 1000+ items.
- **Debounce high-frequency updates**: search inputs, scroll handlers, resize observers.

- **Accessibility (WCAG 2.1 Level A — BITV/EN 301 549)**:
  - **Non-text content**: every `<img>`, `<svg>`, `<canvas>`, `<iframe>` needs a text alternative (`alt`, `aria-label`, `title`). Icons must have `aria-hidden="true"` or a screen-reader-only label.
  - **Keyboard navigation**: all interactive elements must be reachable and operable via keyboard (Tab, Enter, Escape, arrow keys). No focus traps. Use `onKeyDown` for custom widgets.
  - **Focus order**: tab order must follow the visual reading order. Use `tabindex="0"` or `-1` only — never positive `tabindex` values.
  - **Focus visible**: never set `outline: none` without providing a visible focus indicator. Use `:focus-visible` for keyboard-only focus rings.
  - **Semantic HTML**: use `<nav>`, `<main>`, `<aside>`, `<article>`, `<section>`, `<header>`, `<footer>`, `<button>`, `<a>` instead of `<div>` + ARIA. Landmarks must be uniquely labelled when multiple instances exist.
  - **Headings**: exactly one `<h1>` per page, heading levels must not skip (h1 → h2 → h3, never h1 → h3). Screen readers navigate by heading hierarchy.
  - **Links and buttons**: links must have discernible text (not just "click here"). Buttons must describe the action. Same-label elements must point to the same destination.
  - **Forms**: every input must have a visible `<label>` with matching `htmlFor`/`id`. Error messages must be programmatically associated via `aria-describedby`. Required fields marked with `required` or `aria-required="true"`.
  - **Language**: `<html lang="de">` for German pages. Use `lang` attribute on elements with content in a different language.
  - **Motion / animation**: respect `prefers-reduced-motion`. Disable auto-playing animations, parallax, and carousel auto-advance when the user has reduced-motion enabled. Use `@media (prefers-reduced-motion: no-preference)` for decorative animations.
  - **Color contrast**: text must have a contrast ratio of at least 4.5:1 against background (3:1 for large text 18px+ bold or 24px+). Use `recharts` accessible colour palettes in charts — never rely on colour alone to convey information (add patterns, labels, or tooltips).
  - **ARIA live regions**: use `aria-live="polite"` for dynamic content updates (toast notifications, loading spinners, search results). Use `role="status"` or `role="alert"` for important, time-sensitive updates.
  - **Test tools**: run `axe-core` via Lighthouse `a11y` audit or `@axe-core/playwright` in CI. Also test with a screen reader (NVDA on Windows, VoiceOver on macOS).

### Backend / API

- **Profile queries**: check `Database.query()` for missing indexes. Add indexes on columns used in `WHERE`, `ORDER BY`, `JOIN`:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
  ```
- **Reduce N+1 queries**: batch loads with `Promise.all()` or dataloader pattern.
- **Add server-side caching**: memoize expensive computations with `staleTime` on TanStack Query server functions, or use `cache()` from React.
- **Stream large responses**: pageinate list endpoints (`LIMIT/OFFSET`), or use server-sent events for real-time data.
- **Compress responses**: ensure gzip/brotli compression is enabled on the server.
- **CDN/Edge**: move static assets and cacheable API responses to CDN or edge functions.

### SSR / TanStack Start

- **Selective SSR**: set `ssr: false` on routes that don't need server rendering (admin dashboards, user settings).
- **Streaming SSR**: use streaming for routes with async data where the shell can render before all data resolves.
- **ISR / prerendering**: for public pages with infrequent changes, use `static` prerendering or `stale-while-revalidate` caching.
- **Avoid server waterfalls**: prefetch data in parallel on the server using `Promise.all` instead of awaiting sequentially.

## Diagnosis loop (hard bugs)

1. Reproduce the slowness with a performance trace or Lighthouse run.
2. Minimise by isolating the slowest interaction or load phase.
3. Hypothesise the root cause (big re-render, slow query, large asset, etc.).
4. Instrument with targeted profiling (`console.time`, `performance.mark`, React DevTools Profiler).
5. Apply the smallest possible fix.
6. Regression-test the same trace/Lighthouse run to confirm improvement.
