import { useCallback, useEffect, useRef, useState } from "react";

export type ThemeMode = "system" | "dark" | "light";
export type SortOrder = "newest" | "a-z" | "follow-up";
export type PageSize = 10 | 25 | 50 | 100;

export interface Settings {
	theme: ThemeMode;
	locale: string;
	defaultSort: SortOrder;
	pageSize: PageSize;
	askBeforeDelete: boolean;
}

const SETTINGS_KEY = "joborbit-settings";
const SETTINGS_CHANGED = "joborbit:settings-changed";

export const defaultSettings: Settings = {
	theme: "system",
	locale: "auto",
	defaultSort: "newest",
	pageSize: 25,
	askBeforeDelete: true,
};

export const LOCALE_OPTIONS = [
	{ value: "auto", label: "Auto (system default)" },
	{ value: "en-US", label: "English (US)" },
	{ value: "en-GB", label: "English (UK)" },
	{ value: "de-DE", label: "Deutsch" },
	{ value: "fr-FR", label: "Français" },
	{ value: "es-ES", label: "Español" },
	{ value: "it-IT", label: "Italiano" },
	{ value: "pt-BR", label: "Português (BR)" },
	{ value: "nl-NL", label: "Nederlands" },
	{ value: "sv-SE", label: "Svenska" },
	{ value: "da-DK", label: "Dansk" },
	{ value: "no-NO", label: "Norsk" },
	{ value: "fi-FI", label: "Suomi" },
	{ value: "pl-PL", label: "Polski" },
	{ value: "cs-CZ", label: "Čeština" },
	{ value: "hu-HU", label: "Magyar" },
	{ value: "tr-TR", label: "Türkçe" },
	{ value: "ja-JP", label: "日本語" },
	{ value: "ko-KR", label: "한국어" },
	{ value: "zh-CN", label: "中文 (简体)" },
	{ value: "zh-TW", label: "中文 (繁體)" },
];

export const SORT_OPTIONS = [
	{ value: "newest", label: "Newest first" },
	{ value: "a-z", label: "Company A–Z" },
	{ value: "follow-up", label: "Next follow-up" },
];

export const PAGE_SIZE_OPTIONS: PageSize[] = [10, 25, 50, 100];

export function getEffectiveLocale(settings: Settings): string {
	if (settings.locale === "auto") {
		if (typeof navigator !== "undefined") {
			return navigator.language || "en-US";
		}
		return "en-US";
	}
	return settings.locale;
}

export function applyTheme(theme: ThemeMode) {
	const root = document.documentElement;

	if (theme === "dark") {
		root.classList.add("dark");
		root.style.colorScheme = "dark";
	} else if (theme === "light") {
		root.classList.remove("dark");
		root.style.colorScheme = "light";
	} else {
		const prefersDark =
			typeof window.matchMedia === "function" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches;
		if (prefersDark) {
			root.classList.add("dark");
			root.style.colorScheme = "dark";
		} else {
			root.classList.remove("dark");
			root.style.colorScheme = "light";
		}
	}

	try {
		localStorage.setItem("theme", theme);
	} catch {}
}

function loadSettings(): Settings {
	try {
		const stored = localStorage.getItem(SETTINGS_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			return { ...defaultSettings, ...parsed };
		}
	} catch {}
	return { ...defaultSettings };
}

function saveSettings(settings: Settings) {
	try {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
		window.dispatchEvent(
			new CustomEvent(SETTINGS_CHANGED, { detail: settings }),
		);
	} catch {}
}

export function useSettings() {
	const [settings, setSettings] = useState<Settings>(defaultSettings);
	const [loaded, setLoaded] = useState(false);
	const systemListener = useRef<(() => void) | null>(null);

	useEffect(() => {
		const s = loadSettings();
		setSettings(s);
		setLoaded(true);
		applyTheme(s.theme);

		const handler = (e: Event) => {
			setSettings((e as CustomEvent<Settings>).detail);
		};
		window.addEventListener(SETTINGS_CHANGED, handler as EventListener);
		return () => {
			window.removeEventListener(SETTINGS_CHANGED, handler as EventListener);
		};
	}, []);

	useEffect(() => {
		if (settings.theme !== "system") {
			if (systemListener.current) {
				systemListener.current();
				systemListener.current = null;
			}
			return;
		}

		if (typeof window.matchMedia !== "function") return;

		const root = document.documentElement;
		const mq = window.matchMedia("(prefers-color-scheme: dark)");

		function update(e: MediaQueryListEvent | MediaQueryList) {
			if (e.matches) {
				root.classList.add("dark");
				root.style.colorScheme = "dark";
			} else {
				root.classList.remove("dark");
				root.style.colorScheme = "light";
			}
		}

		update(mq);
		const handler = (e: MediaQueryListEvent) => update(e);
		mq.addEventListener("change", handler);
		systemListener.current = () => mq.removeEventListener("change", handler);

		return () => {
			mq.removeEventListener("change", handler);
			systemListener.current = null;
		};
	}, [settings.theme]);

	const update = useCallback((partial: Partial<Settings>) => {
		setSettings((prev) => {
			const next = { ...prev, ...partial };
			saveSettings(next);
			if (partial.theme) {
				applyTheme(next.theme);
			}
			return next;
		});
	}, []);

	const reset = useCallback(() => {
		const next = { ...defaultSettings };
		saveSettings(next);
		applyTheme(next.theme);
		setSettings(next);
	}, []);

	return { settings, update, reset, loaded };
}
