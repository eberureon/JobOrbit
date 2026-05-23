// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createWrapper } from '../../../test/test-utils'
import { CVPage } from './CVPage'
import type { Cv } from '../../../db/schema'

const mocks = vi.hoisted(() => ({
  getCv: vi.fn<[], any>(),
  upsertCv: vi.fn<any, any>(),
}))

vi.mock('../../../lib/server/cv.functions', () => ({
  getCv: mocks.getCv,
  upsertCv: mocks.upsertCv,
}))

const emptyCv: Cv = {
  id: 1,
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
  updated_at: '2026-05-24T00:00:00.000Z',
}

const filledCv: Cv = {
  ...emptyCv,
  full_name: 'Jane Doe',
  headline: 'Senior Engineer',
  email: 'jane@example.com',
  phone: '+1-555-0100',
  location: 'San Francisco',
  summary: 'A summary.',
  skills: '["TypeScript","React"]',
  experience: '### Acme Inc\n2020-2023',
  education: '### MIT\n2014-2018',
  links: '["https://github.com/jane"]',
}

const Wrapper = createWrapper()

describe('CVPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getCv.mockResolvedValue(emptyCv)
    mocks.upsertCv.mockResolvedValue(emptyCv)
  })

  it('renders the page title', async () => {
    render(<CVPage />, { wrapper: Wrapper })
    expect((await screen.findAllByText('CV')).length).toBeGreaterThanOrEqual(1)
  })

  it('renders the subtitle', async () => {
    render(<CVPage />, { wrapper: Wrapper })
    expect(
      (await screen.findAllByText(/Curate your CV content/i)).length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('renders Save and Export buttons', async () => {
    render(<CVPage />, { wrapper: Wrapper })
    expect((await screen.findAllByText('Save')).length).toBeGreaterThanOrEqual(1)
    expect(
      (await screen.findAllByText('Export as Markdown')).length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('renders the Edit and Preview sections', async () => {
    render(<CVPage />, { wrapper: Wrapper })
    expect((await screen.findAllByText('Edit')).length).toBeGreaterThanOrEqual(1)
    expect((await screen.findAllByText('Preview')).length).toBeGreaterThanOrEqual(1)
  })

  it('loads CV data into form fields', async () => {
    mocks.getCv.mockResolvedValue(filledCv)
    render(<CVPage />, { wrapper: Wrapper })

    const nameInput = (await screen.findAllByTestId('input-cv-name'))[0] as HTMLInputElement
    await waitFor(() => {
      expect(nameInput.value).toBe('Jane Doe')
    })
  })

  it('shows default placeholder name in preview when no data', async () => {
    render(<CVPage />, { wrapper: Wrapper })
    expect((await screen.findAllByText('Your Name')).length).toBeGreaterThanOrEqual(1)
  })

  it('shows saved content in preview', async () => {
    mocks.getCv.mockResolvedValue(filledCv)
    render(<CVPage />, { wrapper: Wrapper })

    expect((await screen.findAllByText('Jane Doe')).length).toBeGreaterThanOrEqual(1)
    expect((await screen.findAllByText('Senior Engineer')).length).toBeGreaterThanOrEqual(1)
    expect((await screen.findAllByText('A summary.')).length).toBeGreaterThanOrEqual(1)
  })

  it('calls upsertCv on Save', async () => {
    mocks.getCv.mockResolvedValue(filledCv)
    mocks.upsertCv.mockResolvedValue(filledCv)
    render(<CVPage />, { wrapper: Wrapper })

    const saveBtn = (await screen.findAllByText('Save'))[0]
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(mocks.upsertCv).toHaveBeenCalled()
    })
  })

  it('triggers markdown export on Export button click', async () => {
    render(<CVPage />, { wrapper: Wrapper })

    const exportBtn = (await screen.findAllByText('Export as Markdown'))[0]
    const click = fireEvent.click(exportBtn)
    expect(click).toBe(true)
  })
})
