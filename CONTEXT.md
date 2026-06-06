# JobOrbit Domain Glossary

## Application

A tracked job application with company, role, status, and metadata.

## Company

The organisation a job application is submitted to. Stored as free text; the UI
provides a ComboBox that suggests previously-used company names as the user types,
while still allowing entry of a new company not seen before.

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
Settings are purely client-side and have no server counterpart.

## Source

The channel through which a job application was discovered or initiated. Stored as
free text in the database. The UI presents a curated list of common sources
(LinkedIn, Referral, Recruiter/Agency, Company Website, Direct Email, Networking,
Glassdoor, Indeed, DEVjobs, StepStone, Monster) via a ComboBox that also accepts
arbitrary custom values, so the list is a UX convenience rather than a validation
constraint.

## Accessibility

The app uses semantic HTML landmarks (`<nav>`, `<aside>`, `<main>`, `<section>`),
`role="region"` with `aria-labelledby`/`aria-label` for content sections,
`aria-label` on interactive controls, `aria-pressed`/`aria-checked` for toggle
states, and keyboard-event handlers on clickable table rows (`tabIndex`, `onKeyDown`).
Theme selector uses `role="radiogroup"` with `role="radio"` buttons.
No dedicated a11y testing or linting rules are configured yet.

## Lock

A singleton server-side row (table `lock`, id=1) that controls whether the
application is behind a password gate. Contains an `enabled` boolean (default
false) and a `hash` (nullable bcrypt hash of the password). When the Lock is
enabled, all routes require entering the password before displaying content.
The Lock is toggled from the Settings page UI and can be locked/unlocked
from the sidebar when enabled. "Lock" is distinct from "Settings" — Settings
is per-device client config, Lock is server-side auth state.
