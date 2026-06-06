import { Button, Skeleton } from "@heroui/react";
import { ArrowUpDown } from "lucide-react";
import { RowActions } from "~/components/pages/applications/RowActions";
import { StatusBadge } from "~/components/StatusBadge";
import type { Application } from "~/db/schema";
import { SORT_KEY, type SortKey } from "~/lib/types";

type ApplicationsTableProps = {
	applications: Application[];
	isLoading?: boolean;
	compact?: boolean;
	locale: string;
	sortKey?: SortKey;
	sortDir?: "asc" | "desc";
	onSort?: (key: SortKey) => void;
	onRowClick?: (app: Application) => void;
	onEdit?: (app: Application) => void;
	onDelete?: (app: Application) => void;
	emptyMessage?: string;
	testIdPrefix?: string;
};

export function ApplicationsTable({
	applications,
	isLoading,
	compact = false,
	locale,
	// sortKey,
	// sortDir,
	onSort,
	onRowClick,
	onEdit,
	onDelete,
	emptyMessage = "No applications yet.",
	testIdPrefix = "row-application",
}: ApplicationsTableProps) {
	if (isLoading) {
		return (
			<>
				<div className="hidden md:block overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
								<th className="px-4 py-3 font-medium">Company</th>
								<th className="px-4 py-3 font-medium">Role</th>
								<th className="px-4 py-3 font-medium">Status</th>
								<th className="px-4 py-3 font-medium">Applied</th>
							</tr>
						</thead>
						<tbody>
							{[1, 2, 3, 4, 5].map((i) => (
								<tr key={i} className="border-b border-border/40">
									<td className="px-4 py-3">
										<Skeleton className="h-4 w-28" />
									</td>
									<td className="px-4 py-3">
										<Skeleton className="h-4 w-36" />
									</td>
									<td className="px-4 py-3">
										<Skeleton className="h-5 w-16 rounded-full" />
									</td>
									<td className="px-4 py-3">
										<Skeleton className="h-4 w-16" />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="block md:hidden p-4 space-y-4">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="space-y-2">
							<Skeleton className="h-5 w-40" />
							<Skeleton className="h-4 w-56" />
							<Skeleton className="h-3.5 w-20" />
							<Skeleton className="h-5 w-16 rounded-full" />
						</div>
					))}
				</div>
			</>
		);
	}

	if (applications.length === 0) {
		return (
			<div className="p-12 text-center">
				<div className="text-sm text-muted-foreground">{emptyMessage}</div>
			</div>
		);
	}

	if (compact) {
		return (
			<>
				<div className="hidden xl:block overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
								<th className="pb-2 pr-3 font-medium">Company</th>
								<th className="pb-2 pr-3 font-medium">Role</th>
								<th className="pb-2 pr-3 font-medium">Status</th>
								<th className="pb-2 font-medium">Applied</th>
							</tr>
						</thead>
						<tbody>
							{applications.map((a) => (
								<tr
									key={a.id}
									className="border-b border-border/40 last:border-0"
									data-testid={`${testIdPrefix}-${a.id}`}
								>
									<td className="py-2.5 pr-3 text-foreground">{a.company}</td>
									<td className="py-2.5 pr-3 text-muted-foreground">
										{a.role}
									</td>
									<td className="py-2.5 pr-3">
										<StatusBadge status={a.status} />
									</td>
									<td className="py-2.5 font-mono-num text-muted-foreground text-xs">
										{new Intl.DateTimeFormat(locale, {
											dateStyle: "medium",
										}).format(new Date(a.applied_date))}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="block xl:hidden divide-y divide-border/40">
					{applications.map((a) => (
						<div key={a.id}>
							<p className="pb-0.5 py-2">
								<StatusBadge status={a.status} />
							</p>
							<p className="py-0.5 text-foreground">{a.company}</p>
							<p className="py-0.5 text-muted-foreground">{a.role}</p>
							<p className="pb-2.5 pt-0.5 font-mono-num text-muted-foreground text-xs">
								{new Intl.DateTimeFormat(locale, {
									dateStyle: "medium",
								}).format(new Date(a.applied_date))}
							</p>
						</div>
					))}
				</div>
			</>
		);
	}

	return (
		<>
			<div className="hidden xl:block overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
							<th className="px-2 py-3 font-medium max-w-52">
								<Button
									variant="ghost"
									size="sm"
									className="uppercase text-xs text-muted-foreground px-2"
									onPress={() => onSort?.(SORT_KEY.COMPANY)}
									data-testid="sort-company"
								>
									Company
									<ArrowUpDown className="h-3 w-3" />
								</Button>
							</th>
							<th className="px-4 py-3 font-medium max-w-52">Role</th>
							<th className="px-4 py-3 font-medium">Location</th>
							<th className="px-2 py-3 font-medium">
								<Button
									size="sm"
									variant="ghost"
									className="uppercase text-xs text-muted-foreground px-2"
									onPress={() => onSort?.(SORT_KEY.STATUS)}
									data-testid="sort-status"
								>
									Status
									<ArrowUpDown className="h-3 w-3" />
								</Button>
							</th>
							<th className="px-2 py-3 font-medium">
								<Button
									variant="ghost"
									size="sm"
									className="uppercase text-xs text-muted-foreground px-2"
									onPress={() => onSort?.(SORT_KEY.APPLIED_DATE)}
									data-testid="sort-date"
								>
									Applied
									<ArrowUpDown className="h-3 w-3" />
								</Button>
							</th>
							<th className="px-4 py-3 font-medium">Salary</th>
							<th className="px-4 py-3 font-medium">Source</th>
							<th className="px-4 py-3 font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{applications.map((a) => (
							<tr
								key={a.id}
								data-testid={`${testIdPrefix}-${a.id}`}
								className="border-b border-border/40 last:border-0 hover:bg-muted/10 cursor-pointer"
								onClick={() => onRowClick?.(a)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										onRowClick?.(a);
									}
								}}
								tabIndex={0}
								role="button"
							>
								<td className="px-4 py-3 text-foreground font-medium max-w-52">
									{a.company}
								</td>
								<td className="px-4 py-3 text-foreground/90 max-w-52">
									{a.role}
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{a.location || "\u2014"}
								</td>
								<td className="px-4 py-3">
									<StatusBadge status={a.status} />
								</td>
								<td className="px-4 py-3 font-mono-num text-muted-foreground text-xs">
									{new Intl.DateTimeFormat(locale, {
										dateStyle: "medium",
									}).format(new Date(a.applied_date))}
								</td>
								<td className="px-4 py-3 font-mono-num text-foreground/90 text-xs">
									{a.salary || "\u2014"}
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{a.source || "\u2014"}
								</td>
								<td
									className="px-4 py-3 text-right"
									onClick={(e) => e.stopPropagation()}
									onKeyDown={(e) => e.stopPropagation()}
								>
									<RowActions
										id={a.id}
										jobUrl={a.job_url}
										onEdit={() => onEdit?.(a)}
										onDelete={() => onDelete?.(a)}
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="block xl:hidden divide-y divide-border/40">
				{applications.map((a) => (
					<div
						key={a.id}
						data-testid={`card-${testIdPrefix}-${a.id}`}
						className="p-4 cursor-pointer hover:bg-default/30 transition-colors"
						onClick={() => onRowClick?.(a)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								onRowClick?.(a);
							}
						}}
						role="button"
						tabIndex={0}
					>
						<p className="mb-1.5">
							<StatusBadge status={a.status} />
						</p>
						<p className="text-foreground font-medium">{a.company}</p>
						<p className="text-foreground/90 text-sm mt-0.5">{a.role}</p>
						<div className="space-y-1 text-xs font-mono-num text-muted-foreground mt-2">
							<p>
								<span className="text-muted-foreground/50">Date Aplied: </span>
								{new Intl.DateTimeFormat(locale, {
									dateStyle: "medium",
								}).format(new Date(a.applied_date))}
							</p>
							{a.location && (
								<p>
									<span className="text-muted-foreground/50">Location: </span>
									{a.location}
								</p>
							)}
							{a.salary && (
								<p>
									<span className="text-muted-foreground/50">Salary: </span>
									<span className="font-mono-num">{a.salary}</span>
								</p>
							)}
							{a.source && (
								<p>
									<span className="text-muted-foreground/50">Source: </span>
									{a.source}
								</p>
							)}
						</div>
						<div
							className="flex items-center gap-1 mt-2"
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
						>
							<RowActions
								id={a.id}
								jobUrl={a.job_url}
								onEdit={() => onEdit?.(a)}
								onDelete={() => onDelete?.(a)}
							/>
						</div>
					</div>
				))}
			</div>
		</>
	);
}
