import { Monitor, Moon, Sun } from "lucide-react";
import { type ThemeMode, useSettings } from "~/lib/use-settings";

const NEXT: Record<ThemeMode, ThemeMode> = {
	system: "dark",
	dark: "light",
	light: "system",
};

const LABELS: Record<ThemeMode, string> = {
	system: "Switch to dark mode",
	dark: "Switch to light mode",
	light: "Switch to system mode",
};

const ICONS: Record<ThemeMode, typeof Moon> = {
	system: Monitor,
	dark: Moon,
	light: Sun,
};

export function ThemeToggle() {
	const { settings, update } = useSettings();
	const Icon = ICONS[settings.theme];

	return (
		<button
			type="button"
			onClick={() => update({ theme: NEXT[settings.theme] })}
			className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
			aria-label={LABELS[settings.theme]}
		>
			<Icon className="h-4 w-4" />
		</button>
	);
}
