import { Monitor, Moon, Sun } from "lucide-react";
import type { ThemeMode } from "~/lib/theme";

export function ThemeSelector({
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
