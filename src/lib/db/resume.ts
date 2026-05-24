import { eq } from "drizzle-orm";
import { db } from "~/db/index.ts";
import type { InsertResume } from "~/db/schema.ts";
import { insertResumeSchema, resume } from "~/db/schema.ts";

const EMPTY_RESUME = {
	full_name: "",
	headline: "",
	email: "",
	phone: "",
	location: "",
	summary: "",
	skills: "[]",
	experience: "",
	education: "",
	links: "[]",
};

export function getResume() {
	const existing = db.select().from(resume).where(eq(resume.id, 1)).get();
	if (existing) return existing;
	return db
		.insert(resume)
		.values({ id: 1, ...EMPTY_RESUME })
		.returning()
		.get();
}

export function upsertResume(data: InsertResume) {
	insertResumeSchema.parse(data);
	const existing = db.select().from(resume).where(eq(resume.id, 1)).get();
	const payload = {
		...data,
		updated_at: new Date().toISOString(),
	};
	if (existing) {
		return db
			.update(resume)
			.set(payload)
			.where(eq(resume.id, 1))
			.returning()
			.get();
	}
	const fullData = insertResumeSchema.parse(data);
	return db
		.insert(resume)
		.values({ id: 1, ...fullData, updated_at: new Date().toISOString() })
		.returning()
		.get();
}
