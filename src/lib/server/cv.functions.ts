import { createServerFn } from '@tanstack/react-start'
import { insertCvSchema } from '../../db/schema.ts'
import * as db from '../db/cv.ts'

export const getCv = createServerFn({ method: 'GET' }).handler(async () => {
  return db.getCv()
})

export const upsertCv = createServerFn({ method: 'POST' })
  .inputValidator(insertCvSchema)
  .handler(async ({ data }) => {
    return db.upsertCv(data)
  })
