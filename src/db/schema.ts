import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { APPLICATION_STATUSES } from "~/lib/types";

export const applications = sqliteTable("applications", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	company: text("company").notNull(),
	role: text("role").notNull(),
	location: text("location").notNull().default(""),
	status: text("status").notNull().default("Applied"),
	applied_date: text("applied_date").notNull(),
	salary: text("salary").notNull().default(""),
	source: text("source").notNull().default(""),
	job_url: text("job_url").notNull().default(""),
	notes: text("notes").notNull().default(""),
	created_at: text("created_at")
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
});

export const insertApplicationSchema = createInsertSchema(applications, {
	company: z.string().min(1, "Company is required"),
	role: z.string().min(1, "Role is required"),
	applied_date: z.string().min(1, "Date is required"),
})
	.omit({ id: true, created_at: true })
	.extend({
		status: z.optional(z.enum(APPLICATION_STATUSES).default("Applied")),
	});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

export const resume = sqliteTable("resume", {
	id: integer("id").primaryKey(),
	full_name: text("full_name").notNull().default(""),
	headline: text("headline").notNull().default(""),
	email: text("email").notNull().default(""),
	phone: text("phone").notNull().default(""),
	location: text("location").notNull().default(""),
	summary: text("summary").notNull().default(""),
	skills: text("skills").notNull().default("[]"),
	experience: text("experience").notNull().default(""),
	education: text("education").notNull().default(""),
	links: text("links").notNull().default("[]"),
	updated_at: text("updated_at")
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
});

export const insertResumeSchema = createInsertSchema(resume).omit({
	id: true,
	updated_at: true,
});

export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resume.$inferSelect;

export const statusHistory = sqliteTable("status_history", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	application_id: integer("application_id").notNull(),
	old_status: text("old_status"),
	new_status: text("new_status").notNull(),
	changed_at: text("changed_at")
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
});

export type StatusHistory = typeof statusHistory.$inferSelect;
