import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { readFileSync, readdirSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import * as schema from "./schema.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, "../../drizzle");

export function createDb(dbPath?: string) {
	const resolvedPath =
		dbPath ?? process.env.DATABASE_URL ?? "./data/joborbit.db";
	const isMemory = resolvedPath === ":memory:";

	let sqlite: Database.Database;
	if (isMemory) {
		sqlite = new Database(":memory:");
	} else {
		mkdirSync(dirname(resolvedPath), { recursive: true });
		sqlite = new Database(resolvedPath);
		sqlite.pragma("journal_mode = WAL");
	}

	const database = drizzle(sqlite, { schema });
	ensureSchema(sqlite, database, isMemory);
	return database;
}

function ensureSchema(
	sqlite: Database.Database,
	database: ReturnType<typeof drizzle<typeof schema>>,
	isMemory: boolean,
) {
	if (isMemory) {
		migrate(database, { migrationsFolder: MIGRATIONS_FOLDER });
		return;
	}

	const hasApplications = !!(
		sqlite
			.prepare(
				"SELECT count(*) AS c FROM sqlite_master WHERE type='table' AND name='applications'",
			)
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

			const files = readdirSync(MIGRATIONS_FOLDER)
				.filter((f) => f.endsWith(".sql"))
				.sort();

			const insert = sqlite.prepare(
				"INSERT OR IGNORE INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
			);

			for (const file of files) {
				const sql = readFileSync(join(MIGRATIONS_FOLDER, file), "utf-8");
				const hash = createHash("sha256")
					.update(sql)
					.digest("hex")
					.slice(0, 32);
				insert.run(hash, new Date().toISOString());
			}
		}
	} else {
		migrate(database, { migrationsFolder: MIGRATIONS_FOLDER });
	}
}

export const db = createDb();
