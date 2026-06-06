import { desc, eq } from "drizzle-orm";
import type { DrizzleDb } from "./types";
import { db as defaultDb } from "~/db/index.ts";
import type { StatusHistory } from "~/db/schema.ts";
import { statusHistory } from "~/db/schema.ts";

export function createStatusHistoryRepo(database: DrizzleDb) {
	return {
		listByApplicationId(applicationId: number) {
			return database
				.select()
				.from(statusHistory)
				.where(eq(statusHistory.application_id, applicationId))
				.orderBy(desc(statusHistory.changed_at), desc(statusHistory.id))
				.all() as StatusHistory[];
		},

		listAllStatusHistory() {
			return database
				.select()
				.from(statusHistory)
				.orderBy(desc(statusHistory.changed_at), desc(statusHistory.id))
				.all() as StatusHistory[];
		},

		insertEntry(
			applicationId: number,
			newStatus: string,
			oldStatus: string | null,
			txOverride?: DrizzleDb,
		) {
			const db = txOverride ?? database;
			return db
				.insert(statusHistory)
				.values({
					application_id: applicationId,
					old_status: oldStatus,
					new_status: newStatus,
				})
				.returning()
				.get() as StatusHistory;
		},

		deleteByApplicationId(applicationId: number) {
			database
				.delete(statusHistory)
				.where(eq(statusHistory.application_id, applicationId))
				.run();
		},

		bulkInsertStatusHistory(
			entries: {
				application_id: number;
				old_status: string | null;
				new_status: string;
			}[],
		) {
			return database.transaction((tx) =>
				entries.map(
					(entry) =>
						tx
							.insert(statusHistory)
							.values(entry)
							.returning()
							.get() as StatusHistory,
				),
			);
		},
	};
}

const defaultRepo = createStatusHistoryRepo(defaultDb);
export const {
	listByApplicationId,
	listAllStatusHistory,
	insertEntry,
	deleteByApplicationId,
	bulkInsertStatusHistory,
} = defaultRepo;
