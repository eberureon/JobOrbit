import { createServerFn } from "@tanstack/react-start";
import { insertResumeSchema } from "~/db/schema.ts";
import * as db from "~/lib/db/resume.ts";

export const getResume = createServerFn({ method: "GET" }).handler(async () => {
	return db.getResume();
});

export const upsertResume = createServerFn({ method: "POST" })
	.inputValidator(insertResumeSchema)
	.handler(async ({ data }) => {
		return db.upsertResume(data);
	});
