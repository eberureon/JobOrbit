# In-memory session store for Lock

The app lock feature uses an in-memory `Map<string, { createdAt: number }>` for session storage rather than persisting sessions in the SQLite database. This is a deliberate choice for simplicity — the app is single-user, sessions map to the only authenticated status (no user identity, roles, or multi-tenancy), and session state is meaningful only within a running server process. Adding a `sessions` table, pruning expired rows, and reading it on every request would introduce write amplification and maintenance burden with no practical benefit at this scale.

**Consequence:** All sessions are lost on server restart. When the lock is enabled, every restart forces re-authentication. If persistent sessions become necessary in the future, the migration path is straightforward — swap the in-memory `Map` for a Drizzle-backed table behind the same interface.
