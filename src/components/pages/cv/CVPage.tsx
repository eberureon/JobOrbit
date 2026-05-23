import { useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Download, Save } from 'lucide-react'
import { useToast } from '../../../hooks/use-toast'
import { getCv, upsertCv } from '../../../lib/server/cv.functions'
import type { InsertCv, Cv } from '../../db/schema'

type FormFields = {
  full_name: string
  headline: string
  email: string
  phone: string
  location: string
  summary: string
  skills: string
  experience: string
  education: string
  links: string
}

function parseList(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

function safeParseJson(text: string): string[] {
  try {
    const v = JSON.parse(text)
    return Array.isArray(v) ? v.map(String) : []
  } catch {
    return []
  }
}

function buildMarkdown(values: FormFields, skills: string[], links: string[]): string {
  const lines: string[] = []
  lines.push(`# ${values.full_name || 'Your Name'}`)
  if (values.headline) lines.push(`### ${values.headline}`)
  const contactBits = [values.email, values.phone, values.location].filter(Boolean)
  if (contactBits.length) lines.push(contactBits.join(' · '))
  lines.push('')
  if (values.summary) {
    lines.push('## Summary', '', values.summary, '')
  }
  if (skills.length) {
    lines.push('## Skills', '', skills.map((s) => `- ${s}`).join('\n'), '')
  }
  if (values.experience) {
    lines.push('## Experience', '', values.experience, '')
  }
  if (values.education) {
    lines.push('## Education', '', values.education, '')
  }
  if (links.length) {
    lines.push('## Links', '', links.map((l) => `- ${l}`).join('\n'), '')
  }
  return lines.join('\n')
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className='text-xs uppercase tracking-widest text-muted-foreground font-mono-num mb-2'>
        {title}
      </h3>
      {children}
    </section>
  )
}

function CVPreview({ values, skills, links }: { values: FormFields; skills: string[]; links: string[] }) {
  return (
    <div className='font-sans space-y-5'>
      <div className='border-b border-border pb-4'>
        <div className='text-xs uppercase tracking-widest text-primary font-mono-num'>
          // curriculum vitae
        </div>
        <h2 className='mt-1 text-xl font-semibold text-foreground'>
          {values.full_name || 'Your Name'}
        </h2>
        <div className='text-sm text-muted-foreground mt-0.5'>
          {values.headline || 'Your headline'}
        </div>
        <div className='mt-2 text-xs text-muted-foreground font-mono-num flex flex-wrap gap-x-3 gap-y-1'>
          {values.email && <span>{values.email}</span>}
          {values.phone && <span>· {values.phone}</span>}
          {values.location && <span>· {values.location}</span>}
        </div>
      </div>

      {values.summary && (
        <Section title='Summary'>
          <p className='text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap'>
            {values.summary}
          </p>
        </Section>
      )}

      {skills.length > 0 && (
        <Section title='Skills'>
          <div className='flex flex-wrap gap-1.5'>
            {skills.map((s, i) => (
              <span
                key={i}
                className='text-xs px-2 py-0.5 rounded border border-border bg-muted/50 text-foreground font-mono-num'
              >
                {s}
              </span>
            ))}
          </div>
        </Section>
      )}

      {values.experience && (
        <Section title='Experience'>
          <pre className='whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-sans'>
            {values.experience}
          </pre>
        </Section>
      )}

      {values.education && (
        <Section title='Education'>
          <pre className='whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-sans'>
            {values.education}
          </pre>
        </Section>
      )}

      {links.length > 0 && (
        <Section title='Links'>
          <ul className='space-y-1 text-sm'>
            {links.map((l, i) => (
              <li key={i}>
                <a
                  href={l}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary hover:underline font-mono-num text-xs break-all'
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

export function CVPage() {
  const { data: cv, isLoading } = useQuery<Cv>({
    queryKey: ['cv'],
    queryFn: () => getCv(),
  })
  const { toast } = useToast()

  const form = useForm<FormFields>({
    defaultValues: {
      full_name: '',
      headline: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      skills: '',
      experience: '',
      education: '',
      links: '',
    },
  })

  useEffect(() => {
    if (cv) {
      form.reset({
        full_name: cv.full_name,
        headline: cv.headline,
        email: cv.email,
        phone: cv.phone,
        location: cv.location,
        summary: cv.summary,
        skills: safeParseJson(cv.skills).join('\n'),
        experience: cv.experience,
        education: cv.education,
        links: safeParseJson(cv.links).join('\n'),
      })
    }
  }, [cv])

  const values = form.watch()
  const skillsList = parseList(values.skills)
  const linksList = parseList(values.links)

  const saveMutation = useMutation({
    mutationFn: async (data: FormFields) => {
      const payload: InsertCv = {
        full_name: data.full_name,
        headline: data.headline,
        email: data.email,
        phone: data.phone,
        location: data.location,
        summary: data.summary,
        skills: JSON.stringify(parseList(data.skills)),
        experience: data.experience,
        education: data.education,
        links: JSON.stringify(parseList(data.links)),
      }
      await upsertCv({ data: payload })
    },
    onSuccess: () => {
      toast({ title: 'Saved', description: 'CV updated successfully.' })
    },
    onError: (e: Error) =>
      toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  })

  function exportMarkdown() {
    const md = buildMarkdown(values, skillsList, linksList)
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safeName =
      (values.full_name || 'cv').replace(/\s+/g, '_').toLowerCase() + '.md'
    a.download = safeName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-3'>
        <div>
          <h1 className='text-xl font-semibold tracking-tight text-foreground'>
            CV
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Curate your CV content. Stored locally in your SQLite database.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={exportMarkdown}
            className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-[var(--button-outline)] shadow-xs active:shadow-none min-h-9 px-4 py-2 hover-elevate'
          >
            <Download className='h-4 w-4' />
            Export as Markdown
          </button>
          <button
            onClick={form.handleSubmit((d) => saveMutation.mutate(d))}
            disabled={saveMutation.isPending}
            className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground border border-primary-border min-h-9 px-4 py-2 hover-elevate disabled:opacity-50'
          >
            <Save className='h-4 w-4' />
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='rounded-xl border bg-card border-card-border text-card-foreground shadow-sm card-hairline'>
          <div className='flex flex-col space-y-1.5 p-6 pb-3'>
            <div className='text-sm font-medium'>Edit</div>
          </div>
          <div className='p-6 pt-0'>
            <form
              onSubmit={form.handleSubmit((d) => saveMutation.mutate(d))}
              className='space-y-4'
            >
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div>
                  <label htmlFor='cv-name' className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>Full name</label>
                  <input
                    id='cv-name'
                    {...form.register('full_name')}
                    className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                  />
                </div>
                <div>
                  <label htmlFor='cv-headline' className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>Headline</label>
                  <input
                    id='cv-headline'
                    placeholder='Senior Frontend Engineer'
                    {...form.register('headline')}
                    className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                  />
                </div>
                <div>
                  <label htmlFor='cv-email' className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>Email</label>
                  <input
                    id='cv-email'
                    type='email'
                    {...form.register('email')}
                    className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                  />
                </div>
                <div>
                  <label htmlFor='cv-phone' className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>Phone</label>
                  <input
                    id='cv-phone'
                    {...form.register('phone')}
                    className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                  />
                </div>
                <div className='sm:col-span-2'>
                  <label htmlFor='cv-location' className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>Location</label>
                  <input
                    id='cv-location'
                    {...form.register('location')}
                    className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                  />
                </div>
              </div>

              <div>
                <label htmlFor='cv-summary' className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>Summary</label>
                <textarea
                  id='cv-summary'
                  rows={4}
                  placeholder='A short professional summary...'
                  {...form.register('summary')}
                  className='flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                />
              </div>

              <div>
                <label htmlFor='cv-skills' className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>Skills (one per line)</label>
                <textarea
                  id='cv-skills'
                  rows={5}
                  className='flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono-num'
                  placeholder={'TypeScript\nReact\nNode.js'}
                  {...form.register('skills')}
                />
              </div>

              <div>
                <label htmlFor='cv-experience' className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>Experience (markdown)</label>
                <textarea
                  id='cv-experience'
                  rows={8}
                  className='flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono-num text-xs'
                  placeholder={'### Senior Engineer \u2014 Acme Inc.\n2022 \u2014 Present\n- Built X\n- Led Y'}
                  {...form.register('experience')}
                />
              </div>

              <div>
                <label htmlFor='cv-education' className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>Education (markdown)</label>
                <textarea
                  id='cv-education'
                  rows={5}
                  className='flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono-num text-xs'
                  placeholder={'### BSc Computer Science \u2014 University Name\n2014 \u2014 2018'}
                  {...form.register('education')}
                />
              </div>

              <div>
                <label htmlFor='cv-links' className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>Links (one per line)</label>
                <textarea
                  id='cv-links'
                  rows={4}
                  className='flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono-num text-xs'
                  placeholder={'https://github.com/you\nhttps://linkedin.com/in/you'}
                  {...form.register('links')}
                />
              </div>
            </form>
          </div>
        </div>

        <div className='rounded-xl border bg-card border-card-border text-card-foreground shadow-sm card-hairline lg:sticky lg:top-6 h-fit'>
          <div className='flex flex-row items-center justify-between space-y-0 p-6 pb-3'>
            <div className='text-sm font-medium'>Preview</div>
            <span className='text-xs text-muted-foreground font-mono-num'>live</span>
          </div>
          <div className='p-6 pt-0'>
            {isLoading ? (
              <div className='text-sm text-muted-foreground'>Loading...</div>
            ) : (
              <CVPreview values={values} skills={skillsList} links={linksList} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
