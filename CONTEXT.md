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
