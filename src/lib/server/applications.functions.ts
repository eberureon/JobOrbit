import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { insertApplicationSchema } from "~/db/schema.ts";
import * as db from "~/lib/db/applications.ts";
import {
	bulkInsertStatusHistory,
	listAllStatusHistory,
	listByApplicationId,
} from "~/lib/db/status-history.ts";

export const listApplications = createServerFn({ method: "GET" }).handler(
	async () => {
		return db.listAll();
	},
);

export const getApplication = createServerFn({ method: "GET" })
	.inputValidator((data: { id: number }) => data)
	.handler(async ({ data }) => {
		return db.getById(data.id);
	});

export const createApplication = createServerFn({ method: "POST" })
	.inputValidator(insertApplicationSchema)
	.handler(async ({ data }) => {
		return db.insert(data);
	});

export const updateApplication = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			id: z.number(),
			data: insertApplicationSchema.partial(),
		}),
	)
	.handler(async ({ data }) => {
		return db.update(data.id, data.data);
	});

export const deleteApplication = createServerFn({ method: "POST" })
	.inputValidator((data: { id: number }) => data)
	.handler(async ({ data }) => {
		db.remove(data.id);
		return { success: true };
	});

export const getStats = createServerFn({ method: "GET" }).handler(async () => {
	return db.stats();
});

export const getStatusHistory = createServerFn({ method: "GET" })
	.inputValidator((data: { applicationId: number }) => data)
	.handler(async ({ data }) => {
		return listByApplicationId(data.applicationId);
	});

export const listStatusHistory = createServerFn({ method: "GET" }).handler(
	async () => {
		return listAllStatusHistory();
	},
);

export const importApplications = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			rows: z.array(insertApplicationSchema),
		}),
	)
	.handler(async ({ data }) => {
		const apps = db.bulkInsert(data.rows);
		return { count: apps.length };
	});

const importStatusHistorySchema = z.object({
	rows: z.array(
		z.object({
			application_id: z.number(),
			old_status: z.string().nullable().default(null),
			new_status: z.string().min(1, "new_status is required"),
		}),
	),
});

export const importStatusHistory = createServerFn({ method: "POST" })
	.inputValidator(importStatusHistorySchema)
	.handler(async ({ data }) => {
		const appIds = new Set(
			(db.listAll() as { id: number }[]).map((a) => a.id),
		);
		const valid = data.rows.filter((r) => appIds.has(r.application_id));
		const skipped = data.rows.length - valid.length;
		const entries = bulkInsertStatusHistory(valid);
		return { count: entries.length, skipped };
	});
