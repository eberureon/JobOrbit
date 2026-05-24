import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const [dark, setDark] = useState(true);

	useEffect(() => {
		setDark(document.documentElement.classList.contains("dark"));
	}, []);

	function toggle() {
		const next = !dark;
		setDark(next);
		if (next) {
			document.documentElement.classList.add("dark");
			document.documentElement.dataset.theme = "dark";
			document.documentElement.style.colorScheme = "dark";
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			document.documentElement.dataset.theme = "light";
			document.documentElement.style.colorScheme = "light";
			localStorage.setItem("theme", "light");
		}
	}

	return (
		<button
			type="button"
			onClick={toggle}
			className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
			aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
		>
			{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
		</button>
	);
}
