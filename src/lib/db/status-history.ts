import { db } from '../../db/index.ts'
import { statusHistory } from '../../db/schema.ts'
import { eq, desc } from 'drizzle-orm'
import type { StatusHistory } from '../../db/schema.ts'

export function listByApplicationId(applicationId: number) {
  return db
    .select()
    .from(statusHistory)
    .where(eq(statusHistory.application_id, applicationId))
    .orderBy(desc(statusHistory.changed_at), desc(statusHistory.id))
    .all() as StatusHistory[]
}

export function insertEntry(
  applicationId: number,
  newStatus: string,
  oldStatus: string | null,
) {
  return db
    .insert(statusHistory)
    .values({
      application_id: applicationId,
      old_status: oldStatus,
      new_status: newStatus,
    })
    .returning()
    .get() as StatusHistory
}

export function deleteByApplicationId(applicationId: number) {
  db.delete(statusHistory)
    .where(eq(statusHistory.application_id, applicationId))
    .run()
}
