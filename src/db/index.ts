import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { readFileSync, readdirSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import * as schema from "./schema.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const dbPath = process.env.DATABASE_URL || "./data/joborbit.db";
mkdirSync(dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

const db = drizzle(sqlite, { schema });

const hasApplications = !!(
  sqlite
    .prepare("SELECT count(*) AS c FROM sqlite_master WHERE type='table' AND name='applications'")
    .get() as { c: number }
).c;

if (hasApplications) {
  const hasMeta = !!(
    sqlite
      .prepare(
        "SELECT count(*) AS c FROM sqlite_master WHERE type='table' AND name='__drizzle_migrations'",
      )
      .get() as { c: number }
  ).c;

  if (!hasMeta) {
    sqlite.exec(`CREATE TABLE __drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    )`);

    const migrationDir = resolve(__dirname, "../../drizzle");
    const files = readdirSync(migrationDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const insert = sqlite.prepare(
      "INSERT OR IGNORE INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
    );

    for (const file of files) {
      const sql = readFileSync(join(migrationDir, file), "utf-8");
      const hash = createHash("sha256").update(sql).digest("hex").slice(0, 32);
      insert.run(hash, new Date().toISOString());
    }
  }
} else {
  migrate(db, { migrationsFolder: resolve(__dirname, "../../drizzle") });
}

export { db };
