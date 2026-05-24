import { desc, eq } from "drizzle-orm";
import { db } from "~/db/index.ts";
import type { InsertApplication } from "~/db/schema.ts";
import { applications, insertApplicationSchema, statusHistory } from "~/db/schema.ts";
import { computeStats } from "~/lib/stats.ts";
import type { Stats } from "~/lib/types.ts";
import { deleteByApplicationId, insertEntry } from "./status-history.ts";

export function listAll() {
  return db
    .select()
    .from(applications)
    .orderBy(desc(applications.applied_date), desc(applications.id))
    .all();
}

export function getById(id: number) {
  return db.select().from(applications).where(eq(applications.id, id)).get();
}

export function insert(data: InsertApplication) {
  const app = db.insert(applications).values(data).returning().get();
  insertEntry(app.id, app.status, null);
  return app;
}

export function update(id: number, data: Record<string, unknown>) {
  const partial = insertApplicationSchema.partial().safeParse(data);
  if (!partial.success) throw new Error(partial.error.message);
  if (Object.keys(partial.data).length === 0) {
    return getById(id);
  }
  const old = getById(id);
  if (!old) throw new Error("Application not found");
  const updated = db
    .update(applications)
    .set(partial.data)
    .where(eq(applications.id, id))
    .returning()
    .get();
  if (partial.data.status && partial.data.status !== old.status) {
    insertEntry(id, partial.data.status, old.status);
  }
  return updated;
}

export function remove(id: number) {
  deleteByApplicationId(id);
  db.delete(applications).where(eq(applications.id, id)).run();
}

export function bulkInsert(rows: InsertApplication[]) {
  return db.transaction((tx) =>
    rows.map((data) => {
      const app = tx.insert(applications).values(data).returning().get();
      tx.insert(statusHistory)
        .values({
          application_id: app.id,
          old_status: null,
          new_status: app.status,
        })
        .run();
      return app;
    }),
  );
}

export function stats() {
  const rows = listAll();
  return computeStats(rows) as Stats;
}
