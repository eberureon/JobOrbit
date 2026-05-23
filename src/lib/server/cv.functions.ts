import { createServerFn } from '@tanstack/react-start'
import { db } from '../../db/index.ts'
import { cv, insertCvSchema } from '../../db/schema.ts'
import { eq } from 'drizzle-orm'

const EMPTY_CV = {
  full_name: '',
  headline: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  skills: '[]',
  experience: '',
  education: '',
  links: '[]',
}

export const getCv = createServerFn({ method: 'GET' }).handler(async () => {
  const existing = db.select().from(cv).where(eq(cv.id, 1)).get()
  if (existing) return existing
  return db.insert(cv).values({ id: 1, ...EMPTY_CV }).returning().get()
})

export const upsertCv = createServerFn({ method: 'POST' })
  .inputValidator(insertCvSchema)
  .handler(async ({ data }) => {
    const payload = {
      ...data,
      updated_at: new Date().toISOString(),
    }
    const existing = db.select().from(cv).where(eq(cv.id, 1)).get()
    if (existing) {
      return db
        .update(cv)
        .set(payload)
        .where(eq(cv.id, 1))
        .returning()
        .get()
    }
    return db.insert(cv).values({ id: 1, ...payload }).returning().get()
  })
