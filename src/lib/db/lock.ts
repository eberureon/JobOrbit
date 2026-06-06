import { eq } from "drizzle-orm";
import type { DrizzleDb } from "./types";
import { lock } from "~/db/schema.ts";

export function createLockRepo(database: DrizzleDb) {
	function getLock() {
		const existing = database.select().from(lock).where(eq(lock.id, 1)).get();
		if (existing) return existing;
		return database.insert(lock).values({ id: 1 }).returning().get();
	}

	function upsertLock(data: {
		enabled?: boolean;
		hash?: string | null;
		session_ttl_hours?: number | null;
	}) {
		const existing = database.select().from(lock).where(eq(lock.id, 1)).get();
		if (existing) {
			return database
				.update(lock)
				.set(data)
				.where(eq(lock.id, 1))
				.returning()
				.get();
		}
		return database
			.insert(lock)
			.values({ id: 1, ...data })
			.returning()
			.get();
	}

	return { getLock, upsertLock };
}
