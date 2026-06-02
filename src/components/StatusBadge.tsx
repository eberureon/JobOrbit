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
				color: `var(${v})`,
				borderColor: `color-mix(in oklch, var(${v}) 30%, transparent)`,
				backgroundColor: `color-mix(in oklch, var(${v}) 8%, transparent)`,
			}}
		>
			<span
				className="h-1.5 w-1.5 rounded-full"
				style={{ backgroundColor: `var(${v})` }}
			/>
			{status}
		</span>
	);
}

export function statusColor(status: ApplicationStatus | string): string {
	const v = STATUS_VAR[status as ApplicationStatus] ?? "--muted";
	return `var(${v})`;
}
