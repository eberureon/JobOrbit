import { Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import {
	LOCALE_OPTIONS,
	PAGE_SIZE_OPTIONS,
	type PageSize,
	SORT_OPTIONS,
	type SortOrder,
	type ThemeMode,
	useSettings,
} from "~/lib/use-settings";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../../ui/alert-dialog";
import { Label } from "../../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../ui/select";
import { Separator } from "../../ui/separator";
import { Switch } from "../../ui/switch";

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
						<span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.7)]" />
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
							onValueChange={(locale) => update({ locale })}
						>
							<SelectTrigger className="w-48">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{LOCALE_OPTIONS.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
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
							onValueChange={(defaultSort) =>
								update({ defaultSort: defaultSort as SortOrder })
							}
						>
							<SelectTrigger className="w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{SORT_OPTIONS.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
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
							onValueChange={(v) => update({ pageSize: Number(v) as PageSize })}
						>
							<SelectTrigger className="w-20">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{PAGE_SIZE_OPTIONS.map((size) => (
									<SelectItem key={size} value={String(size)}>
										{size}
									</SelectItem>
								))}
							</SelectContent>
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
							checked={settings.askBeforeDelete}
							onCheckedChange={handleDeleteToggle}
						/>
					</SettingRow>
				</div>
			</div>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Disable delete confirmation?</AlertDialogTitle>
						<AlertDialogDescription>
							When turned off, applications will be deleted immediately without
							asking for confirmation. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								update({ askBeforeDelete: false });
								setDeleteDialogOpen(false);
							}}
						>
							Disable
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
