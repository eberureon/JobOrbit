import { db } from '../../db/index.ts'
import { cv, insertCvSchema } from '../../db/schema.ts'
import { eq } from 'drizzle-orm'
import type { InsertCv } from '../../db/schema.ts'

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

export function getCv() {
  const existing = db.select().from(cv).where(eq(cv.id, 1)).get()
  if (existing) return existing
  return db.insert(cv).values({ id: 1, ...EMPTY_CV }).returning().get()
}

export function upsertCv(data: InsertCv) {
  insertCvSchema.parse(data)
  const existing = db.select().from(cv).where(eq(cv.id, 1)).get()
  const payload = {
    ...data,
    updated_at: new Date().toISOString(),
  }
  if (existing) {
    return db
      .update(cv)
      .set(payload)
      .where(eq(cv.id, 1))
      .returning()
      .get()
  }
  const fullData = insertCvSchema.parse(data)
  return db
    .insert(cv)
    .values({ id: 1, ...fullData, updated_at: new Date().toISOString() })
    .returning()
    .get()
}
