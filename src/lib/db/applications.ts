import { db } from '../../db/index.ts'
import { applications, insertApplicationSchema } from '../../db/schema.ts'
import { eq, desc } from 'drizzle-orm'
import type { Stats } from '../../types.ts'
import type { InsertApplication } from '../../db/schema.ts'
import { computeStats } from '../stats.ts'

export function listAll() {
  return db
    .select()
    .from(applications)
    .orderBy(desc(applications.applied_date), desc(applications.id))
    .all()
}

export function getById(id: number) {
  return db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .get()
}

export function insert(data: InsertApplication) {
  return db.insert(applications).values(data).returning().get()
}

export function update(id: number, data: Record<string, unknown>) {
  const partial = insertApplicationSchema.partial().safeParse(data)
  if (!partial.success) throw new Error(partial.error.message)
  if (Object.keys(partial.data).length === 0) {
    return getById(id)
  }
  return db
    .update(applications)
    .set(partial.data)
    .where(eq(applications.id, id))
    .returning()
    .get()
}

export function remove(id: number) {
  db.delete(applications).where(eq(applications.id, id)).run()
}

export function stats() {
  const rows = listAll()
  return computeStats(rows) as Stats
}
