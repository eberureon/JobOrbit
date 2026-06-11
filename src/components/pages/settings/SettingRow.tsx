import { Label, Description } from "@heroui/react";
import { cn } from "~/lib/utils";

export function SettingRow({
	labelId,
	label,
	description,
	children,
	className,
}: {
	labelId?: string;
	label: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}) {
	const _labelId = labelId ?? label.toLowerCase().replace(/\s+/g, "-");
	return (
		<div
			aria-labelledby={_labelId}
			className={cn(
				"flex flex-wrap sm:items-center justify-between gap-4 my-3",
				className,
			)}
		>
			<div className="flex flex-col gap-0.5">
				<Label id={_labelId} className="text-sm font-medium text-foreground">
					{label}
				</Label>
				{description && (
					<Description className="text-xs text-muted-foreground">
						{description}
					</Description>
				)}
			</div>
			<div className="shrink-0 w-full sm:w-auto">{children}</div>
		</div>
	);
}
