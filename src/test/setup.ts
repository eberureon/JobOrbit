import { afterEach } from 'vitest'

process.env.DATABASE_URL = ':memory:'

afterEach(async () => {
  const mod = await import('../db/index.ts')
  const { applications, cv } = await import('../db/schema.ts')
  mod.db.delete(applications).run()
  mod.db.delete(cv).run()
})
