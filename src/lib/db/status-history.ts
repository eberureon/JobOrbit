import { desc, eq } from "drizzle-orm";
import type { DrizzleDb } from "./types";
import { db as defaultDb } from "~/db/index.ts";
import type { StatusHistory } from "~/db/schema.ts";
import { applications, statusHistory } from "~/db/schema.ts";

export type StatusHistoryInput = {
	application_id: number;
	old_status: string | null;
	new_status: string;
};

export type BulkInsertValidatedResult = { count: number; skipped: number };

export function createStatusHistoryRepo(database: DrizzleDb) {
	const repo = {
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

		bulkInsertStatusHistory(entries: StatusHistoryInput[]) {
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

		bulkInsertValidated(rows: StatusHistoryInput[]): BulkInsertValidatedResult {
			const existingIds = new Set(
				database
					.select({ id: applications.id })
					.from(applications)
					.all()
					.map((r: { id: number }) => r.id),
			);
			const valid = rows.filter((r) => existingIds.has(r.application_id));
			const skipped = rows.length - valid.length;
			if (valid.length === 0) return { count: 0, skipped };
			const entries = repo.bulkInsertStatusHistory(valid);
			return { count: entries.length, skipped };
		},
	};
	return repo;
}

const defaultRepo = createStatusHistoryRepo(defaultDb);
export const {
	listByApplicationId,
	listAllStatusHistory,
	insertEntry,
	deleteByApplicationId,
	bulkInsertStatusHistory,
	bulkInsertValidated,
} = defaultRepo;
