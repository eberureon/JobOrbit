import { ListBox, Select, Separator, Switch } from "@heroui/react";
import { useState } from "react";
import {
	LOCALE_OPTIONS,
	PAGE_SIZE_OPTIONS,
	type PageSize,
	SORT_OPTIONS,
	type SortOrder,
	useSettings,
} from "~/lib/use-settings";
import { AppLockSection } from "./AppLockSection";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { SettingRow, ThemeSelector } from "./index";

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
		<div className="space-y-6 max-w-2xl m-auto">
			<div
				role="region"
				aria-labelledby="section-header"
				className="overflow-hidden rounded-xl border border-card-border bg-card card-hairline px-6 py-7"
			>
				<div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
					<span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)/0.7]" />
					settings
				</div>
				<h1
					id="section-header"
					className="mt-3 text-2xl font-semibold tracking-tight text-foreground"
				>
					Settings
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Customize how JobOrbit looks and behaves. All settings are stored
					locally on this device.
				</p>
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

			<AppLockSection />

			<DeleteConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={() => update({ askBeforeDelete: false })}
			/>
		</div>
	);
}
