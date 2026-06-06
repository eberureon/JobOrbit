import { desc, eq } from "drizzle-orm";
import type { DrizzleDb } from "./types";
import { db as defaultDb } from "~/db/index.ts";
import type { InsertApplication } from "~/db/schema.ts";
import {
	applications,
	insertApplicationSchema,
	statusHistory,
} from "~/db/schema.ts";
import { computeStats } from "~/lib/stats.ts";
import type { Stats } from "~/lib/types.ts";
import { createStatusHistoryRepo } from "./status-history.ts";

export function createApplicationRepo(database: DrizzleDb) {
	const historyRepo = createStatusHistoryRepo(database);

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
			historyRepo.insertEntry(app.id, app.status, null);
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
			if (partial.data.status && partial.data.status !== old.status) {
				historyRepo.insertEntry(id, partial.data.status, old.status);
			}
			return updated;
		},

		remove(id: number) {
			historyRepo.deleteByApplicationId(id);
			database.delete(applications).where(eq(applications.id, id)).run();
		},

		bulkInsert(rows: InsertApplication[]) {
			return database.transaction((tx) =>
				rows.map((data) => {
					const app = tx.insert(applications).values(data).returning().get();
					tx.insert(statusHistory)
						.values({
							application_id: app.id,
							old_status: null,
							new_status: app.status,
						})
						.run();
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
