import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "~/db/index.ts";
import { insertApplicationSchema } from "~/db/schema.ts";
import { createApplicationRepo } from "~/lib/db/applications.ts";
import { createStatusHistoryRepo } from "~/lib/db/status-history.ts";

const appRepo = createApplicationRepo(db);
const historyRepo = createStatusHistoryRepo(db);

function query<T>(fn: () => T) {
	return createServerFn({ method: "GET" }).handler(async () => fn());
}

function mutation<I, O>(input: z.ZodType<I>, fn: (data: I) => O) {
	return createServerFn({ method: "POST" })
		.inputValidator(input)
		.handler(async ({ data }) => fn(data));
}

export const listApplications = query(() => appRepo.listAll());

export const getApplication = mutation(z.object({ id: z.number() }), ({ id }) =>
	appRepo.getById(id),
);

export const createApplication = mutation(insertApplicationSchema, (data) =>
	appRepo.insert(data),
);

export const updateApplication = mutation(
	z.object({
		id: z.number(),
		data: insertApplicationSchema.partial(),
	}),
	({ id, data }) => appRepo.update(id, data),
);

export const deleteApplication = mutation(
	z.object({ id: z.number() }),
	({ id }) => {
		appRepo.remove(id);
		return { success: true as const };
	},
);

export const getStats = mutation(
	z.object({ locale: z.string().optional() }),
	({ locale }) => appRepo.stats(locale),
);

export const getStatusHistory = mutation(
	z.object({ applicationId: z.number() }),
	({ applicationId }) => historyRepo.listByApplicationId(applicationId),
);

export const listStatusHistory = query(() =>
	historyRepo.listAllStatusHistory(),
);

export const importApplications = mutation(
	z.object({ rows: z.array(insertApplicationSchema) }),
	({ rows }) => {
		const apps = appRepo.bulkInsert(rows);
		return { count: apps.length };
	},
);

const importStatusHistorySchema = z.object({
	rows: z.array(
		z.object({
			application_id: z.number(),
			old_status: z.string().nullable().default(null),
			new_status: z.string().min(1, "new_status is required"),
		}),
	),
});

export const importStatusHistory = mutation(
	importStatusHistorySchema,
	({ rows }) => historyRepo.bulkInsertValidated(rows),
);
