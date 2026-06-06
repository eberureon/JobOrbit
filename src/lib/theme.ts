export type ThemeMode = "system" | "dark" | "light";

function setTheme(isDark: boolean) {
	const root = document.documentElement;
	root.classList.toggle("dark", isDark);
	root.style.colorScheme = isDark ? "dark" : "light";
}

export function applyTheme(theme: ThemeMode) {
	if (theme === "dark") {
		setTheme(true);
	} else if (theme === "light") {
		setTheme(false);
	} else {
		const prefersDark =
			typeof window.matchMedia === "function" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches;
		setTheme(prefersDark);
	}

	try {
		localStorage.setItem("theme", theme);
	} catch {}
}

const buildInlineScript = (): string => {
	const body = setTheme.toString();
	return `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"){(${body})(true)}else if(t==="light"){(${body})(false)}else if(!t||t==="system"){var m=window.matchMedia("(prefers-color-scheme:dark)");(${body})(m.matches)}}catch(e){}})();`;
};

export const INLINE_THEME_SCRIPT: string = buildInlineScript();
