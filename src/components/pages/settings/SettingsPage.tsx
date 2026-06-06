import { Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import {
	AlertDialog,
	Button,
	Label,
	ListBox,
	Select,
	Separator,
	Switch,
} from "@heroui/react";
import {
	LOCALE_OPTIONS,
	PAGE_SIZE_OPTIONS,
	type PageSize,
	SORT_OPTIONS,
	type SortOrder,
	useSettings,
} from "~/lib/use-settings";
import type { ThemeMode } from "~/lib/theme";

function ThemeSelector({
	value,
	onChange,
}: {
	value: ThemeMode;
	onChange: (v: ThemeMode) => void;
}) {
	const options: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
		{ value: "system", label: "System", icon: Monitor },
		{ value: "dark", label: "Dark", icon: Moon },
		{ value: "light", label: "Light", icon: Sun },
	];

	return (
		<div className="inline-flex rounded-lg border border-input bg-background p-0.5 gap-0.5">
			{options.map((opt) => {
				const Icon = opt.icon;
				const active = value === opt.value;
				return (
					<button
						key={opt.value}
						type="button"
						onClick={() => onChange(opt.value)}
						className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
							active
								? "bg-primary text-primary-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<Icon className="h-3.5 w-3.5" />
						{opt.label}
					</button>
				);
			})}
		</div>
	);
}

function SettingRow({
	label,
	description,
	children,
}: {
	label: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between gap-4 py-3">
			<div className="space-y-0.5">
				<Label className="text-sm font-medium text-foreground">{label}</Label>
				{description && (
					<p className="text-xs text-muted-foreground">{description}</p>
				)}
			</div>
			<div className="shrink-0">{children}</div>
		</div>
	);
}

export function SettingsPage() {
	const { settings, update } = useSettings();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	function handleDeleteToggle(checked: boolean) {
		if (!checked) {
			setDeleteDialogOpen(true);
		} else {
			update({ askBeforeDelete: true });
		}
	}

	return (
		<div className="space-y-6 max-w-2xl">
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

			<div className="rounded-xl border border-card-border bg-card card-hairline">
				<div className="px-6 pt-6 pb-2">
					<h2 className="text-sm font-semibold text-foreground">Appearance</h2>
				</div>
				<div className="px-6 pb-2">
					<SettingRow
						label="Theme"
						description="Choose your preferred color scheme"
					>
						<ThemeSelector
							value={settings.theme}
							onChange={(theme) => update({ theme })}
						/>
					</SettingRow>
				</div>
				<div className="px-6">
					<Separator />
				</div>
				<div className="px-6 pb-6 pt-2">
					<SettingRow
						label="Locale"
						description="Used for number formatting and translations"
					>
						<Select
							value={settings.locale}
							onChange={(locale) => update({ locale: locale as string })}
							className="w-48"
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
			</div>

			<div className="rounded-xl border border-card-border bg-card card-hairline">
				<div className="px-6 pt-6 pb-2">
					<h2 className="text-sm font-semibold text-foreground">
						Applications
					</h2>
				</div>
				<div className="px-6 pb-2">
					<SettingRow
						label="Default sort"
						description="How applications are ordered"
					>
						<Select
							value={settings.defaultSort}
							onChange={(v) => update({ defaultSort: v as SortOrder })}
							className="w-40"
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
				</div>
				<div className="px-6">
					<Separator />
				</div>
				<div className="px-6 pt-2">
					<SettingRow label="Page size" description="Applications per page">
						<Select
							value={String(settings.pageSize)}
							onChange={(v) => update({ pageSize: Number(v) as PageSize })}
							className="w-20"
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
				</div>
				<div className="px-6">
					<Separator />
				</div>
				<div className="px-6 pb-6 pt-2">
					<SettingRow
						label="Ask before deleting"
						description="Show a confirmation dialog before deleting an application"
					>
						<Switch
							isSelected={settings.askBeforeDelete}
							onChange={handleDeleteToggle}
						>
							<Switch.Control>
								<Switch.Thumb />
							</Switch.Control>
						</Switch>
					</SettingRow>
				</div>
			</div>

			<AlertDialog.Backdrop
				isOpen={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
			>
				<AlertDialog.Container>
					<AlertDialog.Dialog className="sm:max-w-[400px]">
						<AlertDialog.Header>
							<AlertDialog.Heading>
								Disable delete confirmation?
							</AlertDialog.Heading>
						</AlertDialog.Header>
						<AlertDialog.Body>
							<p className="text-sm text-muted-foreground">
								When turned off, applications will be deleted immediately
								without asking for confirmation. This action cannot be undone.
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
