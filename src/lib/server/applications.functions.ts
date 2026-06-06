import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "~/db/index.ts";
import { insertApplicationSchema } from "~/db/schema.ts";
import { createApplicationRepo } from "~/lib/db/applications.ts";
import { createStatusHistoryRepo } from "~/lib/db/status-history.ts";

const appRepo = createApplicationRepo(db);
const historyRepo = createStatusHistoryRepo(db);

export const listApplications = createServerFn({ method: "GET" }).handler(
	async () => appRepo.listAll(),
);

export const getApplication = createServerFn({ method: "GET" })
	.inputValidator(z.object({ id: z.number() }))
	.handler(async ({ data }) => appRepo.getById(data.id));

export const createApplication = createServerFn({ method: "POST" })
	.inputValidator(insertApplicationSchema)
	.handler(async ({ data }) => appRepo.insert(data));

export const updateApplication = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			id: z.number(),
			data: insertApplicationSchema.partial(),
		}),
	)
	.handler(async ({ data }) => appRepo.update(data.id, data.data));

export const deleteApplication = createServerFn({ method: "POST" })
	.inputValidator(z.object({ id: z.number() }))
	.handler(async ({ data }) => {
		appRepo.remove(data.id);
		return { success: true as const };
	});

export const getStats = createServerFn({ method: "GET" })
	.inputValidator(z.object({ locale: z.string().optional() }))
	.handler(async ({ data }) => appRepo.stats(data.locale));

export const getStatusHistory = createServerFn({ method: "GET" })
	.inputValidator(z.object({ applicationId: z.number() }))
	.handler(async ({ data }) =>
		historyRepo.listByApplicationId(data.applicationId),
	);

export const listStatusHistory = createServerFn({ method: "GET" }).handler(
	async () => historyRepo.listAllStatusHistory(),
);

export const importApplications = createServerFn({ method: "POST" })
	.inputValidator(z.object({ rows: z.array(insertApplicationSchema) }))
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
	.handler(async ({ data }) => historyRepo.bulkInsertValidated(data.rows));
