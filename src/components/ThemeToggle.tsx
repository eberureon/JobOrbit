import { Button } from "@heroui/react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useSettings } from "~/lib/use-settings";
import type { ThemeMode } from "~/lib/theme";

const NEXT: Record<ThemeMode, ThemeMode> = {
	system: "dark",
	dark: "light",
	light: "dark",
};

const LABELS: Record<ThemeMode, string> = {
	system: "Switch to dark mode",
	dark: "Switch to light mode",
	light: "Switch to dark mode",
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
		<Button
			type="button"
			isIconOnly
			variant="ghost"
			onClick={() => update({ theme: NEXT[settings.theme] })}
			aria-label={LABELS[settings.theme]}
		>
			<Icon className="h-4 w-4" />
		</Button>
	);
}
