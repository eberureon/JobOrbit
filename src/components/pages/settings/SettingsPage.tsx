import {
	AlertDialog,
	Button,
	Description,
	Input,
	Label,
	ListBox,
	Select,
	Separator,
	Switch,
} from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
	LOCALE_OPTIONS,
	PAGE_SIZE_OPTIONS,
	type PageSize,
	SORT_OPTIONS,
	type SortOrder,
	useSettings,
} from "~/lib/use-settings";
import { SettingRow, ThemeSelector } from "./index";
import { getLock, upsertLock } from "~/lib/server/lock.functions";

const TTL_OPTIONS = [
	{ value: 24, label: "24 hours" },
	{ value: 48, label: "48 hours" },
	{ value: 72, label: "72 hours" },
	{ value: 168, label: "1 week" },
	{ value: -1, label: "Forever" },
];

export function SettingsPage() {
	const { settings, update } = useSettings();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	const { data: lock } = useQuery({
		queryKey: ["lock"],
		queryFn: () => getLock(),
	});

	const [lockEnabled, setLockEnabled] = useState(false);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [sessionTtl, setSessionTtl] = useState<number | null>(null);

	const [lockError, setLockError] = useState("");
	const [lockSuccess, setLockSuccess] = useState(false);

	useEffect(() => {
		if (lock) {
			setLockEnabled(lock.enabled);
			setSessionTtl(lock.session_ttl_hours);
		}
	}, [lock]);

	const upsertMutation = useMutation({
		mutationFn: async (data: {
			enabled?: boolean;
			password?: string;
			currentPassword?: string;
			session_ttl_hours?: number | null;
		}) => upsertLock({ data }),
		onSuccess: () => {
			setLockSuccess(true);
			setLockError("");
			setPassword("");
			setConfirmPassword("");
			setCurrentPassword("");
			queryClient.invalidateQueries({ queryKey: ["lock"] });
			queryClient.invalidateQueries({ queryKey: ["session"] });
		},
		onError: (err: Error) => {
			setLockError(err.message);
			setLockSuccess(false);
		},
	});

	function handleSaveLock() {
		setLockError("");
		setLockSuccess(false);

		if (lockEnabled) {
			if (!lock?.hash && !password) {
				setLockError("Password is required to enable the lock");
				return;
			}
			if (password && password.length < 4) {
				setLockError("Password must be at least 4 characters");
				return;
			}
			if (password && password !== confirmPassword) {
				setLockError("Passwords do not match");
				return;
			}
		}

		const data: {
			enabled?: boolean;
			password?: string;
			currentPassword?: string;
			session_ttl_hours?: number | null;
		} = {};

		if (
			lock?.enabled &&
			(password ||
				lockEnabled !== lock?.enabled ||
				sessionTtl !== lock?.session_ttl_hours)
		) {
			if (!currentPassword) {
				setLockError("Current password is required to change lock settings");
				return;
			}
			data.currentPassword = currentPassword;
		}

		if (lockEnabled !== lock?.enabled) {
			data.enabled = lockEnabled;
		}

		if (password) {
			data.password = password;
		}

		const ttl = sessionTtl === -1 ? null : sessionTtl;
		if (ttl !== lock?.session_ttl_hours) {
			data.session_ttl_hours = ttl;
		}

		if (Object.keys(data).length === 0) return;

		upsertMutation.mutate(data);
	}

	function handleDeleteToggle(checked: boolean) {
		if (!checked) {
			setDeleteDialogOpen(true);
		} else {
			update({ askBeforeDelete: true });
		}
	}

	return (
		<div className="space-y-6 max-w-2xl m-auto">
			<div className="relative overflow-hidden rounded-xl border border-card-border bg-card card-hairline">
				<div className="absolute inset-0 bg-dot-grid opacity-60 pointer-events-none" />
				<div className="relative px-6 py-7">
					<div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
						<span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)/0.7]" />
						settings
					</div>
					<h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
						Settings
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Customize how JobOrbit looks and behaves. All settings are stored
						locally on this device.
					</p>
				</div>
			</div>

			<div
				role="region"
				aria-labelledby="section-appearance"
				className="rounded-xl border border-card-border bg-card card-hairline p-6"
			>
				<h2
					id="section-appearance"
					className="text-sm font-semibold text-foreground"
				>
					Appearance
				</h2>
				<SettingRow
					label="Theme"
					description="Choose your preferred color scheme"
				>
					<ThemeSelector
						value={settings.theme}
						onChange={(theme) => update({ theme })}
					/>
				</SettingRow>
				<Separator />
				<SettingRow
					label="Locale"
					description="Used for number formatting and translations"
					className="pb-0"
				>
					<Select
						id="locale"
						value={settings.locale}
						onChange={(locale) => update({ locale: locale as string })}
						className="w-full sm:w-52"
						aria-label="Locale"
					>
						<Select.Trigger>
							<Select.Value />
							<Select.Indicator />
						</Select.Trigger>
						<Select.Popover>
							<ListBox>
								{LOCALE_OPTIONS.map((opt) => (
									<ListBox.Item
										key={opt.value}
										id={opt.value}
										textValue={opt.label}
									>
										{opt.label}
										<ListBox.ItemIndicator />
									</ListBox.Item>
								))}
							</ListBox>
						</Select.Popover>
					</Select>
				</SettingRow>
			</div>

			<div
				role="region"
				aria-labelledby="section-applications"
				className="rounded-xl border border-card-border bg-card card-hairline p-6"
			>
				<h2
					id="section-applications"
					className="text-sm font-semibold text-foreground"
				>
					Applications
				</h2>
				<SettingRow
					label="Default sort"
					description="How applications are ordered"
				>
					<Select
						value={settings.defaultSort}
						onChange={(v) => update({ defaultSort: v as SortOrder })}
						className="w-full sm:w-40"
						aria-label="Default sort"
					>
						<Select.Trigger>
							<Select.Value />
							<Select.Indicator />
						</Select.Trigger>
						<Select.Popover>
							<ListBox>
								{SORT_OPTIONS.map((opt) => (
									<ListBox.Item
										key={opt.value}
										id={opt.value}
										textValue={opt.label}
									>
										{opt.label}
										<ListBox.ItemIndicator />
									</ListBox.Item>
								))}
							</ListBox>
						</Select.Popover>
					</Select>
				</SettingRow>
				<Separator />
				<SettingRow label="Page size" description="Applications per page">
					<Select
						value={String(settings.pageSize)}
						onChange={(v) => update({ pageSize: Number(v) as PageSize })}
						className="w-full sm:w-20"
						aria-label="Page size"
					>
						<Select.Trigger>
							<Select.Value />
							<Select.Indicator />
						</Select.Trigger>
						<Select.Popover>
							<ListBox>
								{PAGE_SIZE_OPTIONS.map((size) => (
									<ListBox.Item
										key={size}
										id={String(size)}
										textValue={String(size)}
									>
										{size}
										<ListBox.ItemIndicator />
									</ListBox.Item>
								))}
							</ListBox>
						</Select.Popover>
					</Select>
				</SettingRow>
				<Separator />
				<SettingRow
					label="Ask before deleting"
					description="Show a confirmation dialog before deleting an application"
					className="flex-row items-center [&>div:last-child]:w-auto pb-0"
				>
					<Switch
						isSelected={settings.askBeforeDelete}
						onChange={handleDeleteToggle}
						aria-label="Ask before deleting"
					>
						<Switch.Control>
							<Switch.Thumb />
						</Switch.Control>
					</Switch>
				</SettingRow>
			</div>

			<div className="rounded-xl border border-card-border bg-card card-hairline p-6">
				<h2 className="text-sm font-semibold text-foreground">App Lock</h2>
				<>
					<SettingRow
						label="Enable lock"
						description="Require a password to access the app"
					>
						<Switch
							isSelected={lockEnabled}
							onChange={(checked) => setLockEnabled(checked)}
						>
							<Switch.Control>
								<Switch.Thumb />
							</Switch.Control>
						</Switch>
					</SettingRow>
					{lock?.enabled && (
						<>
							<div className="flex flex-col space-y-1 mb-3">
								<Label className="text-sm font-medium text-foreground">
									Current password
								</Label>
								<Input
									type="password"
									placeholder="Enter current password to save changes"
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
								/>
							</div>
						</>
					)}
					<Separator />
				</>
				{lockEnabled && (
					<>
						<div className="mt-3 space-y-4">
							<div className="flex flex-col gap-1">
								<Label
									htmlFor="password"
									className="text-sm font-medium text-foreground"
								>
									Password
								</Label>
								<Input
									id="password"
									type="password"
									aria-describedby="password-description"
									placeholder={lock?.hash ? "Change password" : "Set password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
								<Description id="password-description">
									Must be at least 4 characters
								</Description>
							</div>
							<div className="flex flex-col space-y-1">
								<Label
									htmlFor="confirmPassword"
									className="text-sm font-medium text-foreground"
								>
									Confirm password
								</Label>
								<Input
									id="confirmPassword"
									type="password"
									placeholder="Re-enter password"
									aria-label="Confirm Password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
								/>
							</div>
							<Separator />
							<div className="space-y-1">
								<Label
									htmlFor="sessionDuration"
									className="text-sm font-medium text-foreground"
								>
									Session duration
								</Label>
								<Select
									id="sessionDuration"
									value={String(sessionTtl ?? -1)}
									onChange={(v) =>
										setSessionTtl(Number(v) === -1 ? null : Number(v))
									}
									className="w-40"
									aria-label="Session duration"
								>
									<Select.Trigger>
										<Select.Value />
										<Select.Indicator />
									</Select.Trigger>
									<Select.Popover>
										<ListBox>
											{TTL_OPTIONS.map((opt) => (
												<ListBox.Item
													key={opt.value}
													id={String(opt.value)}
													textValue={opt.label}
												>
													{opt.label}
													<ListBox.ItemIndicator />
												</ListBox.Item>
											))}
										</ListBox>
									</Select.Popover>
								</Select>
							</div>
						</div>
					</>
				)}
				<>
					{lockError && <p className="text-sm text-danger mt-2">{lockError}</p>}
					{lockSuccess && (
						<p className="text-sm text-success mt-2">Lock settings saved.</p>
					)}
					<Button
						className="mt-3"
						onPress={handleSaveLock}
						isPending={upsertMutation.isPending}
					>
						Save
					</Button>
				</>
			</div>

			<AlertDialog.Backdrop
				isOpen={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
			>
				<AlertDialog.Container>
					<AlertDialog.Dialog className="sm:max-w-100">
						<AlertDialog.Header>
							<AlertDialog.Heading>
								Disable delete confirmation?
							</AlertDialog.Heading>
						</AlertDialog.Header>
						<AlertDialog.Body>
							<p className="text-sm text-muted-foreground">
								When turned off, applications will be deleted immediately
								without asking for confirmation. Deletion cannot be undone.
							</p>
						</AlertDialog.Body>
						<AlertDialog.Footer>
							<Button
								variant="tertiary"
								onPress={() => setDeleteDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								variant="danger"
								onPress={() => {
									update({ askBeforeDelete: false });
									setDeleteDialogOpen(false);
								}}
							>
								Disable
							</Button>
						</AlertDialog.Footer>
					</AlertDialog.Dialog>
				</AlertDialog.Container>
			</AlertDialog.Backdrop>
		</div>
	);
}
