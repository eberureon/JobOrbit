import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import type { InsertResume, Resume } from "~/db/schema";
import { useToast } from "~/hooks/use-toast";
import { exportMarkdown } from "~/lib/export-markdown";
import { buildMarkdown, parseList, safeParseJson } from "~/lib/resume";
import { getResume, upsertResume } from "~/lib/server/resume.functions";

type FormFields = {
  full_name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string;
  experience: string;
  education: string;
  links: string;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono-num mb-2">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ResumePreview({
  values,
  skills,
  links,
}: {
  values: FormFields;
  skills: string[];
  links: string[];
}) {
  return (
    <div className="font-sans space-y-5">
      <div className="border-b border-border pb-4">
        <div className="text-xs uppercase tracking-widest text-primary font-mono-num"></div>
        <h2 className="mt-1 text-xl font-semibold text-foreground">
          {values.full_name || "Your Name"}
        </h2>
        <div className="text-sm text-muted-foreground mt-0.5">
          {values.headline || "Your headline"}
        </div>
        <div className="mt-2 text-xs text-muted-foreground font-mono-num flex flex-wrap gap-x-3 gap-y-1">
          {values.email && <span>{values.email}</span>}
          {values.phone && <span>· {values.phone}</span>}
          {values.location && <span>· {values.location}</span>}
        </div>
      </div>

      {values.summary && (
        <Section title="Summary">
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {values.summary}
          </p>
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded border border-border bg-muted/50 text-foreground font-mono-num"
              >
                {s}
              </span>
            ))}
          </div>
        </Section>
      )}

      {values.experience && (
        <Section title="Experience">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-sans">
            {values.experience}
          </pre>
        </Section>
      )}

      {values.education && (
        <Section title="Education">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-sans">
            {values.education}
          </pre>
        </Section>
      )}

      {links.length > 0 && (
        <Section title="Links">
          <ul className="space-y-1 text-sm">
            {links.map((l, i) => (
              <li key={i}>
                <a
                  href={l}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-mono-num text-xs break-all"
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

export function ResumePage() {
  const { data: resume, isLoading } = useQuery<Resume>({
    queryKey: ["resume"],
    queryFn: () => getResume(),
  });
  const { toast } = useToast();

  const form = useForm<FormFields>({
    defaultValues: {
      full_name: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
      skills: "",
      experience: "",
      education: "",
      links: "",
    },
  });

  useEffect(() => {
    if (resume) {
      form.reset({
        full_name: resume.full_name,
        headline: resume.headline,
        email: resume.email,
        phone: resume.phone,
        location: resume.location,
        summary: resume.summary,
        skills: safeParseJson(resume.skills).join("\n"),
        experience: resume.experience,
        education: resume.education,
        links: safeParseJson(resume.links).join("\n"),
      });
    }
  }, [resume]);

  const values = form.watch();
  const skillsList = parseList(values.skills);
  const linksList = parseList(values.links);

  const saveMutation = useMutation({
    mutationFn: async (data: FormFields) => {
      const payload: InsertResume = {
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
      };
      await upsertResume({ data: payload });
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Resume updated successfully." });
    },
    onError: (e: Error) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Resume</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Curate your resume content. Stored locally in your SQLite database.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportMarkdown(values, skillsList, linksList, buildMarkdown)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-[var(--button-outline)] shadow-xs active:shadow-none min-h-9 px-4 py-2 hover-elevate"
          >
            <Download className="h-4 w-4" />
            Export as Markdown
          </button>
          <button
            onClick={form.handleSubmit((d) => saveMutation.mutate(d))}
            disabled={saveMutation.isPending}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground border border-primary-border min-h-9 px-4 py-2 hover-elevate disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card border-card-border text-card-foreground shadow-sm card-hairline">
          <div className="flex flex-col space-y-1.5 p-6 pb-3">
            <div className="text-sm font-medium">Edit</div>
          </div>
          <div className="p-6 pt-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((d) => saveMutation.mutate(d))}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input data-testid="input-resume-name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="headline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headline</FormLabel>
                        <FormControl>
                          <Input placeholder="Senior Frontend Engineer" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="sm:col-span-2">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Summary</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="A short professional summary..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills (one per line)</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono-num"
                          placeholder={"TypeScript\nReact\nNode.js"}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience (markdown)</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={8}
                          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono-num text-xs"
                          placeholder={
                            "### Senior Engineer \u2014 Acme Inc.\n2022 \u2014 Present\n- Built X\n- Led Y"
                          }
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education (markdown)</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono-num text-xs"
                          placeholder={
                            "### BSc Computer Science \u2014 University Name\n2014 \u2014 2018"
                          }
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="links"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Links (one per line)</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono-num text-xs"
                          placeholder={"https://github.com/you\nhttps://linkedin.com/in/you"}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>

        <div className="rounded-xl border bg-card border-card-border text-card-foreground shadow-sm card-hairline lg:sticky lg:top-6 h-fit">
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-3">
            <div className="text-sm font-medium">Preview</div>
            <span className="text-xs text-muted-foreground font-mono-num">live</span>
          </div>
          <div className="p-6 pt-0">
            {isLoading ? (
              <div className="font-sans space-y-5">
                <div className="border-b border-border pb-4 space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-3 w-72" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-12" />
                  <div className="flex flex-wrap gap-1.5">
                    <Skeleton className="h-5 w-16 rounded" />
                    <Skeleton className="h-5 w-20 rounded" />
                    <Skeleton className="h-5 w-14 rounded" />
                    <Skeleton className="h-5 w-24 rounded" />
                    <Skeleton className="h-5 w-18 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-3/5" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-64" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ) : (
              <ResumePreview values={values} skills={skillsList} links={linksList} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
