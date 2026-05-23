import { createServerFn } from '@tanstack/react-start'

export const getHealth = createServerFn({ method: 'GET' }).handler(async () => {
  return { status: 'ok', uptime: process.uptime() }
})
