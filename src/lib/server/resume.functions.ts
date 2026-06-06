import { createServerFn } from "@tanstack/react-start";
import { insertResumeSchema } from "~/db/schema.ts";

export const getResume = createServerFn({ method: "GET" }).handler(async () => {
	const { createResumeRepo } = await import("~/lib/db/resume.ts");
	const { db } = await import("~/db/index.ts");
	return createResumeRepo(db).getResume();
});

export const upsertResume = createServerFn({ method: "POST" })
	.inputValidator(insertResumeSchema)
	.handler(async ({ data }) => {
		const { createResumeRepo } = await import("~/lib/db/resume.ts");
		const { db } = await import("~/db/index.ts");
		return createResumeRepo(db).upsertResume(data);
	});
