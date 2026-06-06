import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { insertApplicationSchema } from "~/db/schema.ts";

function query<T>(fn: () => T) {
	return createServerFn({ method: "GET" }).handler(async () => fn());
}

function mutation<I, O>(input: z.ZodType<I>, fn: (data: I) => O) {
	return createServerFn({ method: "POST" })
		.inputValidator(input)
		.handler(async ({ data }) => fn(data));
}

export const listApplications = query(async () => {
	const { createApplicationRepo } = await import("~/lib/db/applications.ts");
	const { db } = await import("~/db/index.ts");
	return createApplicationRepo(db).listAll();
});

export const getApplication = mutation(
	z.object({ id: z.number() }),
	async ({ id }) => {
		const { createApplicationRepo } = await import("~/lib/db/applications.ts");
		const { db } = await import("~/db/index.ts");
		return createApplicationRepo(db).getById(id);
	},
);

export const createApplication = mutation(
	insertApplicationSchema,
	async (data) => {
		const { createApplicationRepo } = await import("~/lib/db/applications.ts");
		const { db } = await import("~/db/index.ts");
		return createApplicationRepo(db).insert(data);
	},
);

export const updateApplication = mutation(
	z.object({
		id: z.number(),
		data: insertApplicationSchema.partial(),
	}),
	async ({ id, data }) => {
		const { createApplicationRepo } = await import("~/lib/db/applications.ts");
		const { db } = await import("~/db/index.ts");
		return createApplicationRepo(db).update(id, data);
	},
);

export const deleteApplication = mutation(
	z.object({ id: z.number() }),
	async ({ id }) => {
		const { createApplicationRepo } = await import("~/lib/db/applications.ts");
		const { db } = await import("~/db/index.ts");
		createApplicationRepo(db).remove(id);
		return { success: true as const };
	},
);

export const getStats = mutation(
	z.object({ locale: z.string().optional() }),
	async ({ locale }) => {
		const { createApplicationRepo } = await import("~/lib/db/applications.ts");
		const { db } = await import("~/db/index.ts");
		return createApplicationRepo(db).stats(locale);
	},
);

export const getStatusHistory = mutation(
	z.object({ applicationId: z.number() }),
	async ({ applicationId }) => {
		const { createStatusHistoryRepo } =
			await import("~/lib/db/status-history.ts");
		const { db } = await import("~/db/index.ts");
		return createStatusHistoryRepo(db).listByApplicationId(applicationId);
	},
);

export const listStatusHistory = query(async () => {
	const { createStatusHistoryRepo } =
		await import("~/lib/db/status-history.ts");
	const { db } = await import("~/db/index.ts");
	return createStatusHistoryRepo(db).listAllStatusHistory();
});

export const importApplications = mutation(
	z.object({ rows: z.array(insertApplicationSchema) }),
	async ({ rows }) => {
		const { createApplicationRepo } = await import("~/lib/db/applications.ts");
		const { db } = await import("~/db/index.ts");
		const apps = createApplicationRepo(db).bulkInsert(rows);
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
	async ({ rows }) => {
		const { createStatusHistoryRepo } =
			await import("~/lib/db/status-history.ts");
		const { db } = await import("~/db/index.ts");
		return createStatusHistoryRepo(db).bulkInsertValidated(rows);
	},
);
