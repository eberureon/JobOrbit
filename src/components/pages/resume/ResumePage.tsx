import {
	Button,
	Input,
	Label,
	TextArea,
	TextField,
	Skeleton,
} from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, Save } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
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
					<div className="prose prose-sm prose-p:my-1 max-w-none text-foreground/90 prose-headings:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground prose-blockquote:text-foreground prose-li:text-foreground prose-a:text-primary">
						<ReactMarkdown remarkPlugins={[remarkGfm]}>
							{values.experience}
						</ReactMarkdown>
					</div>
				</Section>
			)}

			{values.education && (
				<Section title="Education">
					<div className="prose prose-sm prose-p:my-1 max-w-none text-foreground/90 prose-headings:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground prose-blockquote:text-foreground prose-li:text-foreground prose-a:text-primary">
						<ReactMarkdown remarkPlugins={[remarkGfm]}>
							{values.education}
						</ReactMarkdown>
					</div>
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
					<h1 className="text-xl font-semibold tracking-tight text-foreground">
						Resume
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Curate your resume content. Stored locally in your SQLite database.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onPress={() =>
							exportMarkdown(values, skillsList, linksList, buildMarkdown)
						}
					>
						<Download className="h-4 w-4" />
						Export as Markdown
					</Button>
					<Button
						color="primary"
						isDisabled={saveMutation.isPending}
						onPress={form.handleSubmit((d) => saveMutation.mutate(d))}
					>
						<Save className="h-4 w-4" />
						{saveMutation.isPending ? "Saving..." : "Save"}
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<section
					aria-label="Edit resume"
					className="rounded-xl border bg-card border-card-border text-card-foreground shadow-sm card-hairline"
				>
					<div className="flex flex-col space-y-1.5 p-6 pb-3">
						<h2 className="text-sm font-medium">Edit</h2>
					</div>
					<div className="p-6 pt-0">
						<form
							onSubmit={form.handleSubmit((d) => saveMutation.mutate(d))}
							className="space-y-4"
						>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<Controller
									control={form.control}
									name="full_name"
									render={({ field }) => (
										<TextField fullWidth name="full_name" className="gap-2">
											<Label>Full name</Label>
											<Input data-testid="input-resume-name" {...field} />
										</TextField>
									)}
								/>
								<Controller
									control={form.control}
									name="headline"
									render={({ field }) => (
										<TextField fullWidth name="headline" className="gap-2">
											<Label>Headline</Label>
											<Input
												placeholder="Senior Frontend Engineer"
												{...field}
											/>
										</TextField>
									)}
								/>
								<Controller
									control={form.control}
									name="email"
									render={({ field }) => (
										<TextField fullWidth name="email" className="gap-2">
											<Label>Email</Label>
											<Input type="email" {...field} />
										</TextField>
									)}
								/>
								<Controller
									control={form.control}
									name="phone"
									render={({ field }) => (
										<TextField fullWidth name="phone" className="gap-2">
											<Label>Phone</Label>
											<Input {...field} />
										</TextField>
									)}
								/>
								<div className="sm:col-span-2">
									<Controller
										control={form.control}
										name="location"
										render={({ field }) => (
											<TextField fullWidth name="location" className="gap-2">
												<Label>Location</Label>
												<Input {...field} />
											</TextField>
										)}
									/>
								</div>
							</div>

							<Controller
								control={form.control}
								name="summary"
								render={({ field }) => (
									<TextField fullWidth name="summary" className="gap-2">
										<Label>Summary</Label>
										<TextArea
											rows={6}
											placeholder="A short professional summary..."
											{...field}
										/>
									</TextField>
								)}
							/>

							<Controller
								control={form.control}
								name="skills"
								render={({ field }) => (
									<TextField fullWidth name="skills" className="gap-2">
										<Label>Skills (one per line)</Label>
										<TextArea
											rows={4}
											className="font-mono-num"
											placeholder={"TypeScript\nReact\nNode.js"}
											{...field}
										/>
									</TextField>
								)}
							/>

							<Controller
								control={form.control}
								name="experience"
								render={({ field }) => (
									<TextField fullWidth name="experience" className="gap-2">
										<Label>Experience (markdown)</Label>
										<TextArea
											rows={8}
											className="font-mono-num"
											placeholder={
												"### Senior Engineer \u2014 Acme Inc.\n2022 \u2014 Present\n- Built X\n- Led Y"
											}
											{...field}
										/>
									</TextField>
								)}
							/>

							<Controller
								control={form.control}
								name="education"
								render={({ field }) => (
									<TextField fullWidth name="education" className="gap-2">
										<Label>Education (markdown)</Label>
										<TextArea
											rows={8}
											className="font-mono-num"
											placeholder={
												"### BSc Computer Science \u2014 University Name\n2014 \u2014 2018"
											}
											{...field}
										/>
									</TextField>
								)}
							/>

							<Controller
								control={form.control}
								name="links"
								render={({ field }) => (
									<TextField fullWidth name="links" className="gap-2">
										<Label>Links (one per line)</Label>
										<TextArea
											rows={4}
											className="font-mono-num"
											placeholder={
												"https://github.com/you\nhttps://linkedin.com/in/you"
											}
											{...field}
										/>
									</TextField>
								)}
							/>
						</form>
					</div>
				</section>

				<section
					aria-label="Resume preview"
					className="rounded-xl border bg-card border-card-border text-card-foreground shadow-sm card-hairline lg:sticky lg:top-6 h-fit"
				>
					<div className="flex flex-row items-center justify-between space-y-0 p-6 pb-3">
						<h2 className="text-sm font-medium">Preview</h2>
						<span className="text-xs text-muted-foreground font-mono-num">
							live
						</span>
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
							<ResumePreview
								values={values}
								skills={skillsList}
								links={linksList}
							/>
						)}
					</div>
				</section>
			</div>
		</div>
	);
}
