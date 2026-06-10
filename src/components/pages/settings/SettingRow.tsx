import { Label } from "@heroui/react";
import { cn } from "~/lib/utils";

export function SettingRow({
	id,
	label,
	description,
	children,
	className,
}: {
	id?: string;
	label: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}) {
	const labelId = id ?? label.toLowerCase().replace(/\s+/g, "-");
	return (
		<div
			role="group"
			aria-labelledby={labelId}
			className={cn(
				"flex flex-wrap sm:items-center justify-between gap-4 py-3",
				className,
			)}
		>
			<div className="space-y-0.5">
				<Label id={labelId} className="text-sm font-medium text-foreground">
					{label}
				</Label>
				{description && (
					<p className="text-xs text-muted-foreground">{description}</p>
				)}
			</div>
			<div className="shrink-0 w-full sm:w-auto">{children}</div>
		</div>
	);
}
