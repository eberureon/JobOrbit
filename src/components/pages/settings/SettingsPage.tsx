import { useState } from "react";
import {
	AlertDialog,
	Button,
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

			<div className="rounded-xl border border-card-border bg-card card-hairline p-6">
				<h2 className="text-sm font-semibold text-foreground">Appearance</h2>
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
						value={settings.locale}
						onChange={(locale) => update({ locale: locale as string })}
						className="w-full sm:w-52"
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

			<div className="rounded-xl border border-card-border bg-card card-hairline p-6">
				<h2 className="text-sm font-semibold text-foreground">Applications</h2>
				<SettingRow
					label="Default sort"
					description="How applications are ordered"
				>
					<Select
						value={settings.defaultSort}
						onChange={(v) => update({ defaultSort: v as SortOrder })}
						className="w-full sm:w-40"
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
					>
						<Switch.Control>
							<Switch.Thumb />
						</Switch.Control>
					</Switch>
				</SettingRow>
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
