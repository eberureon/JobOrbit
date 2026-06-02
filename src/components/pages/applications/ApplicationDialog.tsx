import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { StatusBadge } from "~/components/StatusBadge";
import { parseDate } from "@internationalized/date";
import {
	Button,
	Calendar,
	DateField,
	DatePicker,
	FieldError,
	Input,
	Label,
	ListBox,
	Modal,
	Select,
	TextArea,
	TextField,
	Description,
} from "@heroui/react";
import { I18nProvider } from "react-aria-components";
import { toLocalDateString } from "~/lib/date";
import type {
	Application,
	InsertApplication,
	StatusHistory,
} from "~/db/schema";
import { insertApplicationSchema } from "~/db/schema";
import { useToast } from "~/hooks/use-toast";
import {
	createApplication,
	getStatusHistory,
	updateApplication,
} from "~/lib/server/applications.functions";
import type { ApplicationStatus } from "~/lib/types";
import { APPLICATION_STATUSES } from "~/lib/types";
import { getEffectiveLocale, useSettings } from "~/lib/use-settings";

function todayISO(): string {
	return toLocalDateString(new Date());
}

export function ApplicationDialog({
	open,
	onOpenChange,
	editing,
}: {
	open: boolean;
	onOpenChange: (o: boolean) => void;
	editing: Application | null;
}) {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const { settings } = useSettings();
	const locale = getEffectiveLocale(settings);

	const form = useForm<InsertApplication>({
		resolver: zodResolver(insertApplicationSchema),
		values: editing
			? {
					company: editing.company,
					role: editing.role,
					location: editing.location,
					status: editing.status as ApplicationStatus,
					applied_date: editing.applied_date,
					salary: editing.salary,
					source: editing.source,
					job_url: editing.job_url,
					notes: editing.notes,
				}
			: {
					company: "",
					role: "",
					location: "",
					status: "Applied" as ApplicationStatus,
					applied_date: todayISO(),
					salary: "",
					source: "",
					job_url: "",
					notes: "",
				},
	});

	const { data: history = [] } = useQuery<StatusHistory[]>({
		queryKey: ["status-history", editing?.id],
		queryFn: () => getStatusHistory({ data: { applicationId: editing!.id } }),
		enabled: !!editing,
	});

	const mutation = useMutation({
		mutationFn: async (data: InsertApplication) => {
			if (editing) {
				await updateApplication({ data: { id: editing.id, data } });
			} else {
				await createApplication({ data });
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["applications"] });
			queryClient.invalidateQueries({ queryKey: ["stats"] });
			if (editing) {
				queryClient.invalidateQueries({
					queryKey: ["status-history", editing.id],
				});
			}
			toast({
				title: editing ? "Updated" : "Created",
				description: editing ? "Application updated." : "Application added.",
			});
			onOpenChange(false);
		},
		onError: (e: Error) =>
			toast({
				title: "Error",
				description: e.message,
				variant: "destructive",
			}),
	});

	return (
		<Modal.Backdrop isOpen={open} onOpenChange={onOpenChange}>
			<Modal.Container size="lg">
				<Modal.Dialog className="w-[95%] max-w-2xl max-h-[90vh] overflow-y-auto">
					<Modal.Header className="gap-0">
						<Modal.Heading>
							{editing ? "Edit Application" : "Add Application"}
						</Modal.Heading>
						<Description className="text-sm">
							Track a new job application with company, role, status and notes.
						</Description>
					</Modal.Header>
					<Modal.Body>
						<form
							onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
							className="space-y-4"
						>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<Controller
									control={form.control}
									name="company"
									render={({ field, fieldState }) => (
										<TextField
											value={field.value}
											onChange={field.onChange}
											onBlur={field.onBlur}
											isInvalid={!!fieldState.error}
											isRequired
											data-testid="input-company"
										>
											<Label className="text-sm font-medium text-foreground">
												Company
											</Label>
											<Input placeholder="Acme Inc." />
											<FieldError>{fieldState.error?.message}</FieldError>
										</TextField>
									)}
								/>
								<Controller
									control={form.control}
									name="role"
									render={({ field, fieldState }) => (
										<TextField
											value={field.value}
											onChange={field.onChange}
											onBlur={field.onBlur}
											isRequired
											isInvalid={!!fieldState.error}
											data-testid="input-role"
										>
											<Label className="text-sm font-medium text-foreground">
												Role
											</Label>
											<Input placeholder="Senior Engineer" />
											<FieldError>{fieldState.error?.message}</FieldError>
										</TextField>
									)}
								/>
								<Controller
									control={form.control}
									name="location"
									render={({ field, fieldState }) => (
										<TextField
											value={field.value}
											onChange={field.onChange}
											onBlur={field.onBlur}
											isInvalid={!!fieldState.error}
											data-testid="input-location"
										>
											<Label className="text-sm font-medium text-foreground">
												Location
											</Label>
											<Input placeholder="Remote · Berlin" />
											<FieldError>{fieldState.error?.message}</FieldError>
										</TextField>
									)}
								/>
								<Controller
									control={form.control}
									name="status"
									render={({ field, fieldState }) => (
										<div className="flex flex-col gap-1">
											<Label className="text-sm font-medium text-foreground">
												Status
											</Label>
											<Select
												value={field.value}
												onChange={(v) => field.onChange(v)}
												className="w-full reset-input"
												isInvalid={!!fieldState.error}
											>
												<Select.Trigger>
													<Select.Value />
													<Select.Indicator />
												</Select.Trigger>
												<Select.Popover>
													<ListBox>
														{APPLICATION_STATUSES.map((s) => (
															<ListBox.Item
																key={s}
																id={s}
																textValue={s}
																data-testid={`option-status-${s}`}
															>
																{s}
																<ListBox.ItemIndicator />
															</ListBox.Item>
														))}
													</ListBox>
												</Select.Popover>
											</Select>
											<FieldError>{fieldState.error?.message}</FieldError>
										</div>
									)}
								/>
								<Controller
									control={form.control}
									name="applied_date"
									render={({ field, fieldState }) => (
										<I18nProvider locale={locale}>
											<DatePicker
												value={field.value ? parseDate(field.value) : null}
												onChange={(value) =>
													field.onChange(value ? value.toString() : "")
												}
												onBlur={field.onBlur}
												isInvalid={!!fieldState.error}
												isRequired
												shouldForceLeadingZeros
												data-testid="input-applied-date"
											>
												<Label className="text-sm font-medium text-foreground">
													Applied Date
												</Label>
												<DateField.Group fullWidth className="reset-input">
													<DateField.Input>
														{(segment) => (
															<DateField.Segment segment={segment} />
														)}
													</DateField.Input>
													<DateField.Suffix>
														<DatePicker.Trigger>
															<DatePicker.TriggerIndicator />
														</DatePicker.Trigger>
													</DateField.Suffix>
												</DateField.Group>
												<FieldError>{fieldState.error?.message}</FieldError>
												<DatePicker.Popover>
													<Calendar aria-label="Applied date">
														<Calendar.Header>
															<Calendar.YearPickerTrigger>
																<Calendar.YearPickerTriggerHeading />
																<Calendar.YearPickerTriggerIndicator />
															</Calendar.YearPickerTrigger>
															<Calendar.NavButton slot="previous" />
															<Calendar.NavButton slot="next" />
														</Calendar.Header>
														<Calendar.Grid>
															<Calendar.GridHeader>
																{(day) => (
																	<Calendar.HeaderCell>
																		{day}
																	</Calendar.HeaderCell>
																)}
															</Calendar.GridHeader>
															<Calendar.GridBody>
																{(date) => <Calendar.Cell date={date} />}
															</Calendar.GridBody>
														</Calendar.Grid>
														<Calendar.YearPickerGrid>
															<Calendar.YearPickerGridBody>
																{({ year }) => (
																	<Calendar.YearPickerCell year={year} />
																)}
															</Calendar.YearPickerGridBody>
														</Calendar.YearPickerGrid>
													</Calendar>
												</DatePicker.Popover>
											</DatePicker>
										</I18nProvider>
									)}
								/>
								<Controller
									control={form.control}
									name="salary"
									render={({ field, fieldState }) => (
										<TextField
											value={field.value}
											onChange={field.onChange}
											onBlur={field.onBlur}
											isInvalid={!!fieldState.error}
											data-testid="input-salary"
										>
											<Label className="text-sm font-medium text-foreground">
												Salary
											</Label>
											<Input placeholder="$120k or €60k-80k" />
											<FieldError>{fieldState.error?.message}</FieldError>
										</TextField>
									)}
								/>
								<Controller
									control={form.control}
									name="source"
									render={({ field, fieldState }) => (
										<TextField
											value={field.value}
											onChange={field.onChange}
											onBlur={field.onBlur}
											isInvalid={!!fieldState.error}
											data-testid="input-source"
										>
											<Label className="text-sm font-medium text-foreground">
												Source
											</Label>
											<Input placeholder="LinkedIn / Referral / Indeed" />
											<FieldError>{fieldState.error?.message}</FieldError>
										</TextField>
									)}
								/>
								<Controller
									control={form.control}
									name="job_url"
									render={({ field, fieldState }) => (
										<TextField
											value={field.value}
											onChange={field.onChange}
											onBlur={field.onBlur}
											isInvalid={!!fieldState.error}
											data-testid="input-job-url"
										>
											<Label className="text-sm font-medium text-foreground">
												Job URL
											</Label>
											<Input placeholder="https://…" />
											<FieldError>{fieldState.error?.message}</FieldError>
										</TextField>
									)}
								/>
							</div>
							<Controller
								control={form.control}
								name="notes"
								render={({ field, fieldState }) => (
									<TextField
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										isInvalid={!!fieldState.error}
										data-testid="input-notes"
									>
										<Label className="text-sm font-medium text-foreground">
											Notes
										</Label>
										<TextArea placeholder="Recruiter contact, interview prep, etc." />
										<FieldError>{fieldState.error?.message}</FieldError>
									</TextField>
								)}
							/>
							{editing && history.length > 0 && (
								<div className="border-t border-border/60 pt-4">
									<h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
										Status History
									</h4>
									<div className="space-y-1.5">
										{history.map((entry) => (
											<div
												key={entry.id}
												className="flex items-center gap-2 text-sm flex-wrap"
											>
												<span className="font-mono-num text-xs text-muted-foreground shrink-0">
													{new Intl.DateTimeFormat(locale, {
														dateStyle: "medium",
													}).format(new Date(entry.changed_at))}
												</span>
												<span className="text-muted-foreground/60">|</span>
												{entry.old_status ? (
													<>
														<StatusBadge status={entry.old_status} />
														<span className="text-muted-foreground/50">
															&rarr;
														</span>
														<StatusBadge status={entry.new_status} />
													</>
												) : (
													<StatusBadge status={entry.new_status} />
												)}
											</div>
										))}
									</div>
								</div>
							)}
							<div className="flex items-center justify-end gap-2 pt-2">
								<Button
									variant="outline"
									onPress={() => onOpenChange(false)}
									data-testid="button-cancel"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									isDisabled={mutation.isPending}
									data-testid="button-submit-application"
								>
									{mutation.isPending
										? "Saving…"
										: editing
											? "Save changes"
											: "Add application"}
								</Button>
							</div>
						</form>
					</Modal.Body>
				</Modal.Dialog>
			</Modal.Container>
		</Modal.Backdrop>
	);
}
