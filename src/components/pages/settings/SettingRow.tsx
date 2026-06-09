import { Label } from "@heroui/react";
import { cn } from "~/lib/utils";

export function SettingRow({
	label,
	description,
	children,
	className,
}: {
	label: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3",
				className,
			)}
		>
			<div className="space-y-0.5">
				<Label className="text-sm font-medium text-foreground">{label}</Label>
				{description && (
					<p className="text-xs text-muted-foreground">{description}</p>
				)}
			</div>
			<div className="shrink-0 w-full sm:w-auto">{children}</div>
		</div>
	);
}
