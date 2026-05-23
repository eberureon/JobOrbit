import { createServerFn } from '@tanstack/react-start'
import { insertApplicationSchema } from '../../db/schema.ts'
import * as db from '../db/applications.ts'

export const listApplications = createServerFn({ method: 'GET' }).handler(async () => {
  return db.listAll()
})

export const getApplication = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    return db.getById(data.id)
  })

export const createApplication = createServerFn({ method: 'POST' })
  .inputValidator(insertApplicationSchema)
  .handler(async ({ data }) => {
    return db.insert(data)
  })

export const updateApplication = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { id, ...fields } = data as { id: number } & Record<string, unknown>
    return db.update(id, fields)
  })

export const deleteApplication = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    db.remove(data.id)
    return { success: true }
  })

export const getStats = createServerFn({ method: 'GET' }).handler(async () => {
  return db.stats()
})
