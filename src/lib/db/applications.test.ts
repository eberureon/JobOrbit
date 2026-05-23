import { describe, it, expect } from 'vitest'
import { listAll, getById, insert, update, remove } from './applications'

const validApp = {
  company: 'Acme Inc',
  role: 'Engineer',
  applied_date: '2026-05-20',
}

describe('listAll', () => {
  it('returns empty array when no applications exist', () => {
    expect(listAll()).toEqual([])
  })

  it('returns all applications ordered by date desc then id desc', () => {
    const a = insert({ ...validApp, company: 'Oldest', applied_date: '2026-05-01' })
    const b = insert({ ...validApp, company: 'Middle', applied_date: '2026-05-15' })
    const c = insert({ ...validApp, company: 'Newest', applied_date: '2026-05-20' })
    const result = listAll()
    expect(result.map((r) => r.id)).toEqual([c.id, b.id, a.id])
  })
})

describe('getById', () => {
  it('returns the application for a valid id', () => {
    const created = insert(validApp)
    const result = getById(created.id)
    expect(result).toBeDefined()
    expect(result!.company).toBe('Acme Inc')
  })

  it('returns undefined for a nonexistent id', () => {
    expect(getById(999)).toBeUndefined()
  })
})

describe('insert', () => {
  it('inserts and returns the application with id and created_at', () => {
    const result = insert(validApp)
    expect(result.id).toBeGreaterThan(0)
    expect(result.company).toBe('Acme Inc')
    expect(result.role).toBe('Engineer')
    expect(result.applied_date).toBe('2026-05-20')
    expect(result.created_at).toBeDefined()
  })
})

describe('update', () => {
  it('updates specified fields and returns updated row', () => {
    const created = insert(validApp)
    const updated = update(created.id, { company: 'Updated Corp', role: 'Senior Engineer' })
    expect(updated.company).toBe('Updated Corp')
    expect(updated.role).toBe('Senior Engineer')
    expect(updated.applied_date).toBe('2026-05-20')
  })

  it('returns existing row when update data is empty', () => {
    const created = insert(validApp)
    const result = update(created.id, {})
    expect(result.company).toBe('Acme Inc')
  })

  it('rejects invalid fields', () => {
    const created = insert(validApp)
    expect(() => update(created.id, { company: '' })).toThrow()
  })
})

describe('remove', () => {
  it('removes the application', () => {
    const created = insert(validApp)
    remove(created.id)
    expect(getById(created.id)).toBeUndefined()
  })

  it('succeeds for nonexistent id', () => {
    expect(() => remove(999)).not.toThrow()
  })
})
