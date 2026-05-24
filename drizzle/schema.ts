import { sqliteTable, AnySQLiteColumn, integer, text } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const applications = sqliteTable("applications", {
	id: integer().primaryKey({ autoIncrement: true }),
	company: text().notNull(),
	role: text().notNull(),
	location: text().default("").notNull(),
	status: text().default("Applied").notNull(),
	appliedDate: text("applied_date").notNull(),
	salary: text().default("").notNull(),
	source: text().default("").notNull(),
	jobUrl: text("job_url").default("").notNull(),
	notes: text().default("").notNull(),
	createdAt: text("created_at").default("sql`(CURRENT_TIMESTAMP)`").notNull(),
});

export const cv = sqliteTable("cv", {
	id: integer().primaryKey(),
	fullName: text("full_name").default("").notNull(),
	headline: text().default("").notNull(),
	email: text().default("").notNull(),
	phone: text().default("").notNull(),
	location: text().default("").notNull(),
	summary: text().default("").notNull(),
	skills: text().default("[]").notNull(),
	experience: text().default("").notNull(),
	education: text().default("").notNull(),
	links: text().default("[]").notNull(),
	updatedAt: text("updated_at").default("sql`(CURRENT_TIMESTAMP)`").notNull(),
});

export const statusHistory = sqliteTable("status_history", {
	id: integer().primaryKey({ autoIncrement: true }),
	applicationId: integer("application_id").notNull(),
	oldStatus: text("old_status"),
	newStatus: text("new_status").notNull(),
	changedAt: text("changed_at").default("sql`(CURRENT_TIMESTAMP)`").notNull(),
});

export const resume = sqliteTable("resume", {
	id: integer().primaryKey(),
	fullName: text("full_name").default("").notNull(),
	headline: text().default("").notNull(),
	email: text().default("").notNull(),
	phone: text().default("").notNull(),
	location: text().default("").notNull(),
	summary: text().default("").notNull(),
	skills: text().default("[]").notNull(),
	experience: text().default("").notNull(),
	education: text().default("").notNull(),
	links: text().default("[]").notNull(),
	updatedAt: text("updated_at").default("sql`(CURRENT_TIMESTAMP)`").notNull(),
});

