import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "~/db/index.ts";
import { insertApplicationSchema } from "~/db/schema.ts";
import { createApplicationRepo } from "~/lib/db/applications.ts";
import { createStatusHistoryRepo } from "~/lib/db/status-history.ts";

const appRepo = createApplicationRepo(db);
const historyRepo = createStatusHistoryRepo(db);

export const listApplications = createServerFn({ method: "GET" }).handler(
	async () => {
		return appRepo.listAll();
	},
);

export const getApplication = createServerFn({ method: "GET" })
	.inputValidator((data: { id: number }) => data)
	.handler(async ({ data }) => {
		return appRepo.getById(data.id);
	});

export const createApplication = createServerFn({ method: "POST" })
	.inputValidator(insertApplicationSchema)
	.handler(async ({ data }) => {
		return appRepo.insert(data);
	});

export const updateApplication = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			id: z.number(),
			data: insertApplicationSchema.partial(),
		}),
	)
	.handler(async ({ data }) => {
		return appRepo.update(data.id, data.data);
	});

export const deleteApplication = createServerFn({ method: "POST" })
	.inputValidator((data: { id: number }) => data)
	.handler(async ({ data }) => {
		appRepo.remove(data.id);
		return { success: true };
	});

export const getStats = createServerFn({ method: "GET" })
	.inputValidator((data: { locale?: string }) => data)
	.handler(async ({ data }) => {
		return appRepo.stats(data.locale);
	});

export const getStatusHistory = createServerFn({ method: "GET" })
	.inputValidator((data: { applicationId: number }) => data)
	.handler(async ({ data }) => {
		return historyRepo.listByApplicationId(data.applicationId);
	});

export const listStatusHistory = createServerFn({ method: "GET" }).handler(
	async () => {
		return historyRepo.listAllStatusHistory();
	},
);

export const importApplications = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			rows: z.array(insertApplicationSchema),
		}),
	)
	.handler(async ({ data }) => {
		const apps = appRepo.bulkInsert(data.rows);
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
		const allApps = appRepo.listAll() as { id: number }[];
		const appIds = new Set(allApps.map((a) => a.id));
		const valid = data.rows.filter((r) => appIds.has(r.application_id));
		const skipped = data.rows.length - valid.length;
		const entries = historyRepo.bulkInsertStatusHistory(valid);
		return { count: entries.length, skipped };
	});
