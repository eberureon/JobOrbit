import { createServerFn } from '@tanstack/react-start'
import { db } from '../../db/index.ts'
import { applications, insertApplicationSchema } from '../../db/schema.ts'
import { eq, desc } from 'drizzle-orm'
import type { Stats } from '../../types.ts'
import { computeStats } from '../stats.ts'

export const listApplications = createServerFn({ method: 'GET' }).handler(async () => {
  return db
    .select()
    .from(applications)
    .orderBy(desc(applications.applied_date), desc(applications.id))
    .all()
})

export const getApplication = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    return db
      .select()
      .from(applications)
      .where(eq(applications.id, data.id))
      .get()
  })

export const createApplication = createServerFn({ method: 'POST' })
  .inputValidator(insertApplicationSchema)
  .handler(async ({ data }) => {
    return db.insert(applications).values(data).returning().get()
  })

export const updateApplication = createServerFn({ method: 'POST' })
  .inputValidator((input: { id: number; data: Record<string, unknown> }) => input)
  .handler(async ({ data }) => {
    const partial = insertApplicationSchema.partial().safeParse(data.data)
    if (!partial.success) throw new Error(partial.error.message)
    if (Object.keys(partial.data).length === 0) {
      return db
        .select()
        .from(applications)
        .where(eq(applications.id, data.id))
        .get()
    }
    return db
      .update(applications)
      .set(partial.data)
      .where(eq(applications.id, data.id))
      .returning()
      .get()
  })

export const deleteApplication = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    db.delete(applications).where(eq(applications.id, data.id)).run()
    return { success: true }
  })

export const getStats = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = db.select().from(applications).all()
  return computeStats(rows) as Stats
})
