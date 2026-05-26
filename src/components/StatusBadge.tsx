import type { ApplicationStatus } from "~/lib/types";

const STATUS_VAR: Record<ApplicationStatus, string> = {
	Applied: "--status-applied",
	Interview: "--status-interview",
	Offer: "--status-offer",
	Accepted: "--status-accepted",
	Rejected: "--status-rejected",
	Withdrawn: "--status-withdrawn",
};

export function StatusBadge({
	status,
}: {
	status: ApplicationStatus | string;
}) {
	const v = STATUS_VAR[status as ApplicationStatus] ?? "--muted-foreground";
	return (
		<span
			className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums"
			style={{
				color: `oklch(var(${v}))`,
				borderColor: `oklch(var(${v}) / 0.3)`,
				backgroundColor: `oklch(var(${v}) / 0.08)`,
			}}
		>
			<span
				className="h-1.5 w-1.5 rounded-full"
				style={{ backgroundColor: `oklch(var(${v}))` }}
			/>
			{status}
		</span>
	);
}

export function statusColor(status: ApplicationStatus | string): string {
	const v = STATUS_VAR[status as ApplicationStatus] ?? "--muted-foreground";
	return `oklch(var(${v}))`;
}
