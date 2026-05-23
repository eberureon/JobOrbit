import { describe, it, expect } from 'vitest'
import { parseList, safeParseJson, buildMarkdown } from './cv'

describe('parseList', () => {
  it('splits newline-separated text into trimmed strings', () => {
    expect(parseList('a\n b \nc')).toEqual(['a', 'b', 'c'])
  })

  it('filters empty lines', () => {
    expect(parseList('a\n\nb\n\n\nc')).toEqual(['a', 'b', 'c'])
  })

  it('returns empty array for empty string', () => {
    expect(parseList('')).toEqual([])
  })

  it('returns empty array for whitespace-only input', () => {
    expect(parseList('  \n \n  ')).toEqual([])
  })

  it('handles single line', () => {
    expect(parseList('hello')).toEqual(['hello'])
  })
})

describe('safeParseJson', () => {
  it('parses a JSON string array', () => {
    expect(safeParseJson('["a","b","c"]')).toEqual(['a', 'b', 'c'])
  })

  it('returns empty array for non-array JSON', () => {
    expect(safeParseJson('"hello"')).toEqual([])
    expect(safeParseJson('42')).toEqual([])
    expect(safeParseJson('{}')).toEqual([])
  })

  it('returns empty array for invalid JSON', () => {
    expect(safeParseJson('not json')).toEqual([])
  })

  it('returns empty array for empty string', () => {
    expect(safeParseJson('')).toEqual([])
  })

  it('converts non-string array elements to strings', () => {
    expect(safeParseJson('[1, 2, 3]')).toEqual(['1', '2', '3'])
    expect(safeParseJson('[true, false]')).toEqual(['true', 'false'])
  })
})

describe('buildMarkdown', () => {
  const baseValues = {
    full_name: 'Jane Doe',
    headline: 'Senior Engineer',
    email: 'jane@example.com',
    phone: '+1-555-0100',
    location: 'San Francisco',
    summary: 'A summary.',
    experience: '### Acme Inc\n2020-2023\n- Built X',
    education: '### MIT\n2014-2018\nBS CS',
  }

  it('builds a complete markdown document', () => {
    const md = buildMarkdown(baseValues, ['TypeScript', 'React'], ['https://github.com/jane'])
    expect(md).toContain('# Jane Doe')
    expect(md).toContain('### Senior Engineer')
    expect(md).toContain('jane@example.com')
    expect(md).toContain('## Summary')
    expect(md).toContain('A summary.')
    expect(md).toContain('## Skills')
    expect(md).toContain('- TypeScript')
    expect(md).toContain('- React')
    expect(md).toContain('## Experience')
    expect(md).toContain('### Acme Inc')
    expect(md).toContain('## Education')
    expect(md).toContain('### MIT')
    expect(md).toContain('## Links')
    expect(md).toContain('- https://github.com/jane')
  })

  it('uses default name when full_name is empty', () => {
    const md = buildMarkdown(
      { ...baseValues, full_name: '' },
      [],
      [],
    )
    expect(md).toContain('# Your Name')
  })

  it('omits headline section when empty', () => {
    const md = buildMarkdown(
      { ...baseValues, headline: '' },
      [],
      [],
    )
    const headingLines = md.split('\n').filter((l) => l.startsWith('### '))
    expect(headingLines).toEqual(['### Acme Inc', '### MIT'])
  })

  it('omits contact line when all contact fields are empty', () => {
    const md = buildMarkdown(
      { ...baseValues, email: '', phone: '', location: '' },
      [],
      [],
    )
    expect(md).not.toContain('@')
    expect(md).not.toContain('·')
  })

  it('omits summary section when empty', () => {
    const md = buildMarkdown({ ...baseValues, summary: '' }, [], [])
    expect(md).not.toContain('## Summary')
  })

  it('omits skills section when empty', () => {
    const md = buildMarkdown(baseValues, [], [])
    expect(md).not.toContain('## Skills')
  })

  it('omits experience section when empty', () => {
    const md = buildMarkdown({ ...baseValues, experience: '' }, [], [])
    expect(md).not.toContain('## Experience')
  })

  it('omits education section when empty', () => {
    const md = buildMarkdown({ ...baseValues, education: '' }, [], [])
    expect(md).not.toContain('## Education')
  })

  it('omits links section when empty', () => {
    const md = buildMarkdown(baseValues, ['TypeScript'], [])
    expect(md).not.toContain('## Links')
  })

  it('handles minimal input (name only)', () => {
    const md = buildMarkdown(
      {
        full_name: 'Alice',
        headline: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        experience: '',
        education: '',
      },
      [],
      [],
    )
    expect(md).toContain('# Alice')
    expect(md.trim()).toBe('# Alice')
  })
})
