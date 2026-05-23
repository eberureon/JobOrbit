import { createServerFn } from '@tanstack/react-start'
import { db } from '../../db/index.ts'
import { applications, insertApplicationSchema } from '../../db/schema.ts'
import { eq, desc } from 'drizzle-orm'
import type { ApplicationStatus, Stats } from '../../db/schema.ts'
import { APPLICATION_STATUSES } from '../../db/schema.ts'

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
  const now = new Date()
  const dayMs = 24 * 60 * 60 * 1000
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const today = startOfDay(now)

  let last7 = 0
  let last30 = 0
  const statusBreakdown: Record<ApplicationStatus, number> = {
    Applied: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0,
    Accepted: 0,
    Withdrawn: 0,
  }
  const companyCounts: Record<string, number> = {}

  for (const r of rows) {
    const s = r.status as ApplicationStatus
    if (statusBreakdown[s] !== undefined) statusBreakdown[s] += 1
    companyCounts[r.company] = (companyCounts[r.company] || 0) + 1
    const d = new Date(r.applied_date)
    if (!isNaN(d.getTime())) {
      const diff = today.getTime() - startOfDay(d).getTime()
      if (diff <= 7 * dayMs && diff >= 0) last7 += 1
      if (diff <= 30 * dayMs && diff >= 0) last30 += 1
    }
  }

  const advancedFromInterview =
    statusBreakdown.Interview + statusBreakdown.Offer + statusBreakdown.Accepted
  const reachedOffer = statusBreakdown.Offer + statusBreakdown.Accepted
  const funnel = {
    applied: rows.length,
    interview: advancedFromInterview,
    offer: reachedOffer,
    accepted: statusBreakdown.Accepted,
    rejected: statusBreakdown.Rejected,
  }

  const timeline: { date: string; count: number }[] = []
  const tlMap: Record<string, number> = {}
  for (const r of rows) {
    const d = new Date(r.applied_date)
    if (isNaN(d.getTime())) continue
    const diff = today.getTime() - startOfDay(d).getTime()
    if (diff < 0 || diff > 90 * dayMs) continue
    const key = startOfDay(d).toISOString().slice(0, 10)
    tlMap[key] = (tlMap[key] || 0) + 1
  }
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today.getTime() - i * dayMs)
    const key = d.toISOString().slice(0, 10)
    timeline.push({ date: key, count: tlMap[key] || 0 })
  }

  const topCompanies = Object.entries(companyCounts)
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const stats: Stats = {
    total: rows.length,
    last7Days: last7,
    last30Days: last30,
    statusBreakdown,
    funnel,
    timeline,
    topCompanies,
  }
  return stats
})
