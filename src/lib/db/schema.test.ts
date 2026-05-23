import { describe, it, expect } from 'vitest'
import { insertApplicationSchema, insertCvSchema } from '../../db/schema'

describe('insertApplicationSchema', () => {
  const valid = {
    company: 'Acme Inc',
    role: 'Engineer',
    applied_date: '2026-05-20',
  }

  it('accepts valid minimal data', () => {
    const result = insertApplicationSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('accepts data with all optional fields', () => {
    const result = insertApplicationSchema.safeParse({
      ...valid,
      location: 'Remote',
      status: 'Interview',
      salary: '$120k',
      source: 'LinkedIn',
      job_url: 'https://example.com',
      notes: 'Some notes',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty company', () => {
    const result = insertApplicationSchema.safeParse({ ...valid, company: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty role', () => {
    const result = insertApplicationSchema.safeParse({ ...valid, role: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty applied_date', () => {
    const result = insertApplicationSchema.safeParse({ ...valid, applied_date: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid status', () => {
    const result = insertApplicationSchema.safeParse({ ...valid, status: 'InvalidStatus' })
    expect(result.success).toBe(false)
  })

  it('defaults status to Applied when omitted', () => {
    const result = insertApplicationSchema.parse(valid)
    expect(result.status).toBe('Applied')
  })

  it('defaults optional strings to empty string when omitted', () => {
    const result = insertApplicationSchema.parse(valid)
    expect(result.location).toBe('')
    expect(result.salary).toBe('')
    expect(result.source).toBe('')
    expect(result.job_url).toBe('')
    expect(result.notes).toBe('')
  })
})

describe('insertCvSchema', () => {
  it('accepts empty CV data with all defaults', () => {
    const result = insertCvSchema.safeParse({})
    expect(result.success).toBe(true)
    const data = insertCvSchema.parse({})
    expect(data.full_name).toBe('')
    expect(data.headline).toBe('')
    expect(data.skills).toBe('[]')
    expect(data.links).toBe('[]')
  })

  it('accepts fully populated CV data', () => {
    const result = insertCvSchema.safeParse({
      full_name: 'Jane Doe',
      headline: 'Senior Engineer',
      email: 'jane@example.com',
      phone: '+1-555-0100',
      location: 'San Francisco',
      summary: 'A summary.',
      skills: '["TypeScript","React"]',
      experience: '### Acme Inc',
      education: '### MIT',
      links: '["https://github.com/jane"]',
    })
    expect(result.success).toBe(true)
  })

  it('rejects non-string skills', () => {
    const result = insertCvSchema.safeParse({ skills: 123 })
    expect(result.success).toBe(false)
  })
})
