import { createServerFn } from "@tanstack/react-start";
import { db } from "~/db/index.ts";
import { insertResumeSchema } from "~/db/schema.ts";
import { createResumeRepo } from "~/lib/db/resume.ts";

const resumeRepo = createResumeRepo(db);

export const getResume = createServerFn({ method: "GET" }).handler(async () =>
	resumeRepo.getResume(),
);

export const upsertResume = createServerFn({ method: "POST" })
	.inputValidator(insertResumeSchema)
	.handler(async ({ data }) => resumeRepo.upsertResume(data));
