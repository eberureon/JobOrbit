import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Cv, InsertCv } from "@shared/schema";
import { insertCvSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Download, Save } from "lucide-react";

type FormFields = {
  full_name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string; // newline separated
  experience: string;
  education: string;
  links: string; // newline separated
};

function parseList(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function safeParseJson(text: string): string[] {
  try {
    const v = JSON.parse(text);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export default function CV() {
  const { data: cv, isLoading } = useQuery<Cv>({
    queryKey: ["/api/cv"],
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
    if (cv) {
      form.reset({
        full_name: cv.full_name,
        headline: cv.headline,
        email: cv.email,
        phone: cv.phone,
        location: cv.location,
        summary: cv.summary,
        skills: safeParseJson(cv.skills).join("\n"),
        experience: cv.experience,
        education: cv.education,
        links: safeParseJson(cv.links).join("\n"),
      });
    }
  }, [cv]); // eslint-disable-line react-hooks/exhaustive-deps

  const values = form.watch();
  const skillsList = parseList(values.skills);
  const linksList = parseList(values.links);

  const saveMutation = useMutation({
    mutationFn: async (data: FormFields) => {
      const payload: InsertCv = insertCvSchema.parse({
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
      });
      await apiRequest("PUT", "/api/cv", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cv"] });
      toast({ title: "Saved", description: "CV updated successfully." });
    },
    onError: (e: Error) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  function exportMarkdown() {
    const md = buildMarkdown(values, skillsList, linksList);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName =
      (values.full_name || "cv").replace(/\s+/g, "_").toLowerCase() + ".md";
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            CV
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Curate your CV content. Stored locally in your SQLite database.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={exportMarkdown}
            data-testid="button-export-md"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export as Markdown
          </Button>
          <Button
            onClick={form.handleSubmit((d) => saveMutation.mutate(d))}
            disabled={saveMutation.isPending}
            data-testid="button-save-cv"
          >
            <Save className="h-4 w-4 mr-1.5" />
            {saveMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="card-hairline">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Edit</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit((d) => saveMutation.mutate(d))}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cv-name">Full name</Label>
                  <Input
                    id="cv-name"
                    data-testid="input-cv-name"
                    {...form.register("full_name")}
                  />
                </div>
                <div>
                  <Label htmlFor="cv-headline">Headline</Label>
                  <Input
                    id="cv-headline"
                    data-testid="input-cv-headline"
                    placeholder="Senior Frontend Engineer"
                    {...form.register("headline")}
                  />
                </div>
                <div>
                  <Label htmlFor="cv-email">Email</Label>
                  <Input
                    id="cv-email"
                    data-testid="input-cv-email"
                    type="email"
                    {...form.register("email")}
                  />
                </div>
                <div>
                  <Label htmlFor="cv-phone">Phone</Label>
                  <Input
                    id="cv-phone"
                    data-testid="input-cv-phone"
                    {...form.register("phone")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="cv-location">Location</Label>
                  <Input
                    id="cv-location"
                    data-testid="input-cv-location"
                    {...form.register("location")}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cv-summary">Summary</Label>
                <Textarea
                  id="cv-summary"
                  data-testid="input-cv-summary"
                  rows={4}
                  placeholder="A short professional summary…"
                  {...form.register("summary")}
                />
              </div>

              <div>
                <Label htmlFor="cv-skills">Skills (one per line)</Label>
                <Textarea
                  id="cv-skills"
                  data-testid="input-cv-skills"
                  rows={5}
                  className="font-mono-num"
                  placeholder={"TypeScript\nReact\nNode.js"}
                  {...form.register("skills")}
                />
              </div>

              <div>
                <Label htmlFor="cv-experience">Experience (markdown)</Label>
                <Textarea
                  id="cv-experience"
                  data-testid="input-cv-experience"
                  rows={8}
                  className="font-mono-num text-xs"
                  placeholder={"### Senior Engineer — Acme Inc.\n2022 — Present\n- Built X\n- Led Y"}
                  {...form.register("experience")}
                />
              </div>

              <div>
                <Label htmlFor="cv-education">Education (markdown)</Label>
                <Textarea
                  id="cv-education"
                  data-testid="input-cv-education"
                  rows={5}
                  className="font-mono-num text-xs"
                  placeholder={"### BSc Computer Science — University Name\n2014 — 2018"}
                  {...form.register("education")}
                />
              </div>

              <div>
                <Label htmlFor="cv-links">Links (one per line)</Label>
                <Textarea
                  id="cv-links"
                  data-testid="input-cv-links"
                  rows={4}
                  className="font-mono-num text-xs"
                  placeholder={"https://github.com/you\nhttps://linkedin.com/in/you"}
                  {...form.register("links")}
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card
          className="card-hairline lg:sticky lg:top-6 h-fit"
          data-testid="cv-preview"
        >
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Preview</CardTitle>
            <span className="text-xs text-muted-foreground font-mono-num">
              live
            </span>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <CVPreview values={values} skills={skillsList} links={linksList} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CVPreview({
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
        <div className="text-xs uppercase tracking-widest text-primary font-mono-num">
          // curriculum vitae
        </div>
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

function buildMarkdown(
  values: FormFields,
  skills: string[],
  links: string[]
): string {
  const lines: string[] = [];
  lines.push(`# ${values.full_name || "Your Name"}`);
  if (values.headline) lines.push(`### ${values.headline}`);
  const contactBits = [values.email, values.phone, values.location].filter(Boolean);
  if (contactBits.length) lines.push(contactBits.join(" · "));
  lines.push("");
  if (values.summary) {
    lines.push("## Summary", "", values.summary, "");
  }
  if (skills.length) {
    lines.push("## Skills", "", skills.map((s) => `- ${s}`).join("\n"), "");
  }
  if (values.experience) {
    lines.push("## Experience", "", values.experience, "");
  }
  if (values.education) {
    lines.push("## Education", "", values.education, "");
  }
  if (links.length) {
    lines.push("## Links", "", links.map((l) => `- ${l}`).join("\n"), "");
  }
  return lines.join("\n");
}
