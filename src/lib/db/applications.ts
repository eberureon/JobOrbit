import { desc, eq } from "drizzle-orm";
import type { DrizzleDb } from "./types";
import { db as defaultDb } from "~/db/index.ts";
import type { InsertApplication } from "~/db/schema.ts";
import { applications, insertApplicationSchema } from "~/db/schema.ts";
import { computeStats } from "~/lib/stats.ts";
import type { Stats } from "~/lib/types.ts";
import { createStatusHistoryRepo } from "./status-history.ts";

function withHistory(repo: ReturnType<typeof createStatusHistoryRepo>) {
	return {
		onInsert(app: { id: number; status: string }, tx?: DrizzleDb) {
			repo.insertEntry(app.id, app.status, null, tx);
		},
		onUpdate(
			id: number,
			newStatus: string | undefined,
			oldStatus: string | null | undefined,
		) {
			if (newStatus && newStatus !== oldStatus) {
				repo.insertEntry(id, newStatus, oldStatus ?? null);
			}
		},
		onDelete(id: number) {
			repo.deleteByApplicationId(id);
		},
	};
}

export function createApplicationRepo(database: DrizzleDb) {
	const historyRepo = createStatusHistoryRepo(database);
	const history = withHistory(historyRepo);

	function listAll() {
		return database
			.select()
			.from(applications)
			.orderBy(desc(applications.applied_date), desc(applications.id))
			.all();
	}

	function getById(id: number) {
		return database
			.select()
			.from(applications)
			.where(eq(applications.id, id))
			.get();
	}

	return {
		listAll,
		getById,

		insert(data: InsertApplication) {
			const app = database.insert(applications).values(data).returning().get();
			history.onInsert(app);
			return app;
		},

		update(id: number, data: Record<string, unknown>) {
			const partial = insertApplicationSchema.partial().safeParse(data);
			if (!partial.success) throw new Error(partial.error.message);
			if (Object.keys(partial.data).length === 0) {
				return getById(id);
			}
			const old = getById(id);
			if (!old) throw new Error("Application not found");
			const updated = database
				.update(applications)
				.set(partial.data)
				.where(eq(applications.id, id))
				.returning()
				.get();
			history.onUpdate(id, partial.data.status, old.status);
			return updated;
		},

		remove(id: number) {
			history.onDelete(id);
			database.delete(applications).where(eq(applications.id, id)).run();
		},

		bulkInsert(rows: InsertApplication[]) {
			return database.transaction((tx: DrizzleDb) =>
				rows.map((data) => {
					const app = tx.insert(applications).values(data).returning().get();
					history.onInsert(app, tx);
					return app;
				}),
			);
		},

		stats(locale?: string) {
			const rows = listAll();
			const history = historyRepo.listAllStatusHistory();
			return computeStats(rows, history, locale) as Stats;
		},
	};
}

const defaultRepo = createApplicationRepo(defaultDb);
export const { listAll, getById, insert, update, remove, bulkInsert, stats } =
	defaultRepo;
