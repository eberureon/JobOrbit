# JobOrbit Domain Glossary

## Application

A tracked job application with company, role, status, and metadata.

## Status History

A chronological log of status changes for an Application. Each entry records
the previous and new status along with when the change occurred.

## Status History Entry

A single row in the status history recording one status transition:
`old_status → new_status` at a point in time.

When an Application is created, an implicit first entry is recorded with
`old_status = null` and `new_status` set to the application's initial status.

When an Application is deleted, its Status History entries are cascade-deleted.

## Settings

Per-device configuration stored in `localStorage` under the `joborbit-settings` key.
Settings include Theme (system/dark/light), Locale, default sort order, page size,
and delete confirmation toggle. The `theme` value is also mirrored to a separate
`localStorage` key for an inline `<script>` in `__root.tsx` that prevents FOUC.

## Accessibility

The app uses semantic HTML landmarks (`<nav>`, `<aside>`, `<main>`, `<section>`),
`role="region"` with `aria-labelledby`/`aria-label` for content sections,
`aria-label` on interactive controls, `aria-pressed`/`aria-checked` for toggle
states, and keyboard-event handlers on clickable table rows (`tabIndex`, `onKeyDown`).
Theme selector uses `role="radiogroup"` with `role="radio"` buttons.
No dedicated a11y testing or linting rules are configured yet.
