import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpDown, Filter, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Application } from "@/db/schema";
import { useToast } from "@/hooks/use-toast";
import {
	deleteApplication,
	listApplications,
} from "@/lib/server/applications.functions";
import type { ApplicationStatus } from "@/types";
import { APPLICATION_STATUSES } from "@/types";
import { ApplicationDialog } from "./ApplicationDialog";
import { RowActions } from "./RowActions";

type SortKey = "applied_date" | "company" | "status";

export function ApplicationsPage() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const { data: apps = [], isLoading } = useQuery<Application[]>({
		queryKey: ["applications"],
		queryFn: () => listApplications(),
	});

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<ApplicationStatus>>(
		new Set(),
	);
	const [sortKey, setSortKey] = useState<SortKey>("applied_date");
	const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<Application | null>(null);
	const [deleteId, setDeleteId] = useState<number | null>(null);

	const filtered = useMemo(() => {
		let list = [...apps];
		if (search.trim()) {
			const q = search.toLowerCase();
			list = list.filter(
				(a) =>
					a.company.toLowerCase().includes(q) ||
					a.role.toLowerCase().includes(q),
			);
		}
		if (statusFilter.size > 0) {
			list = list.filter((a) =>
				statusFilter.has(a.status as ApplicationStatus),
			);
		}
		list.sort((a, b) => {
			const av = (a as any)[sortKey];
			const bv = (b as any)[sortKey];
			if (av < bv) return sortDir === "asc" ? -1 : 1;
			if (av > bv) return sortDir === "asc" ? 1 : -1;
			return 0;
		});
		return list;
	}, [apps, search, statusFilter, sortKey, sortDir]);

	function toggleStatus(s: ApplicationStatus) {
		setStatusFilter((prev) => {
			const next = new Set(prev);
			if (next.has(s)) next.delete(s);
			else next.add(s);
			return next;
		});
	}

	function toggleSort(k: SortKey) {
		if (sortKey === k) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortKey(k);
			setSortDir(k === "applied_date" ? "desc" : "asc");
		}
	}

	const deleteMutation = useMutation({
		mutationFn: async (id: number) => {
			await deleteApplication({ data: { id } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["applications"] });
			queryClient.invalidateQueries({ queryKey: ["stats"] });
			toast({ title: "Deleted", description: "Application removed." });
			setDeleteId(null);
		},
		onError: (e: Error) =>
			toast({ title: "Error", description: e.message, variant: "destructive" }),
	});

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between flex-wrap gap-3">
				<div>
					<h1 className="text-xl font-semibold tracking-tight text-foreground">
						Applications
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						<span className="font-mono-num" data-testid="text-app-count">
							{filtered.length}
						</span>{" "}
						of {apps.length} shown
					</p>
				</div>
				<Button
					data-testid="button-add-application"
					onClick={() => {
						setEditing(null);
						setDialogOpen(true);
					}}
				>
					<Plus className="h-4 w-4 mr-1.5" />
					Add Application
				</Button>
			</div>

			<Card className="card-hairline">
				<CardContent className="p-4 flex flex-wrap items-center gap-3">
					<div className="relative flex-1 min-w-[200px]">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							data-testid="input-search"
							placeholder="Search company or role…"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-9"
							suppressHydrationWarning
						/>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" data-testid="button-filter-status">
								<Filter className="h-4 w-4 mr-1.5" />
								Status
								{statusFilter.size > 0 && (
									<span className="ml-2 rounded bg-primary/15 text-primary px-1.5 py-0.5 text-xs font-mono-num">
										{statusFilter.size}
									</span>
								)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Filter status</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{APPLICATION_STATUSES.map((s) => (
								<DropdownMenuCheckboxItem
									key={s}
									checked={statusFilter.has(s)}
									onCheckedChange={() => toggleStatus(s)}
									data-testid={`filter-status-${s}`}
								>
									{s}
								</DropdownMenuCheckboxItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
					{statusFilter.size > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setStatusFilter(new Set())}
							data-testid="button-clear-filters"
						>
							<X className="h-3.5 w-3.5 mr-1" />
							Clear
						</Button>
					)}
				</CardContent>
			</Card>

			<Card className="card-hairline overflow-hidden">
				<CardContent className="p-0">
					{isLoading ? (
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
					) : filtered.length === 0 ? (
						<div className="p-12 text-center">
							<div className="text-sm text-muted-foreground">
								{apps.length === 0
									? 'No applications yet. Click "Add Application" to get started.'
									: "No applications match your filters."}
							</div>
						</div>
					) : (
						<>
							<div className="hidden lg:block overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
											<th className="px-4 py-3 font-medium">
												<Button
													variant="ghost"
													size="sm"
													className="uppercase"
													onClick={() => toggleSort("company")}
													data-testid="sort-company"
												>
													Company
													<ArrowUpDown className="h-3 w-3" />
												</Button>
											</th>
											<th className="px-4 py-3 font-medium">Role</th>
											<th className="px-4 py-3 font-medium">Location</th>
											<th className="px-4 py-3 font-medium">
												<Button
													size="sm"
													variant="ghost"
													className="uppercase"
													onClick={() => toggleSort("status")}
													data-testid="sort-status"
												>
													Status
													<ArrowUpDown className="h-3 w-3" />
												</Button>
											</th>
											<th className="px-4 py-3 font-medium">
												<Button
													variant="ghost"
													size="sm"
													className="uppercase"
													onClick={() => toggleSort("applied_date")}
													data-testid="sort-date"
												>
													Applied
													<ArrowUpDown className="h-3 w-3" />
												</Button>
											</th>
											<th className="px-4 py-3 font-medium">Salary</th>
											<th className="px-4 py-3 font-medium">Source</th>
											<th className="px-4 py-3 font-medium text-right">
												Actions
											</th>
										</tr>
									</thead>
									<tbody>
										{filtered.map((a) => (
											<tr
												key={a.id}
												data-testid={`row-application-${a.id}`}
												className="border-b border-border/40 last:border-0 hover:bg-muted/30 cursor-pointer"
												onClick={() => {
													setEditing(a);
													setDialogOpen(true);
												}}
											>
												<td className="px-4 py-3 text-foreground font-medium">
													{a.company}
												</td>
												<td className="px-4 py-3 text-foreground/90">
													{a.role}
												</td>
												<td className="px-4 py-3 text-muted-foreground">
													{a.location || "\u2014"}
												</td>
												<td className="px-4 py-3">
													<StatusBadge status={a.status} />
												</td>
												<td className="px-4 py-3 font-mono-num text-muted-foreground text-xs">
													{a.applied_date}
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
														onEdit={() => {
															setEditing(a);
															setDialogOpen(true);
														}}
														onDelete={() => setDeleteId(a.id)}
													/>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<div className="block lg:hidden divide-y divide-border/40">
								{filtered.map((a) => {
									return (
										<div
											key={a.id}
											data-testid={`card-application-${a.id}`}
											className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
											onClick={() => {
												setEditing(a);
												setDialogOpen(true);
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													setEditing(a);
													setDialogOpen(true);
												}
											}}
											role="button"
											tabIndex={0}
										>
											<p className="text-foreground font-medium">{a.company}</p>
											<p className="text-foreground/90 text-sm mt-0.5">
												{a.role}
											</p>
											<p className="mt-1.5">
												<StatusBadge status={a.status} />
											</p>
											<div className="space-y-1 text-xs font-mono-num text-muted-foreground mt-2">
												<p>
													<span className="text-muted-foreground/50">
														Date Aplied:{" "}
													</span>
													{new Intl.DateTimeFormat("de-DE", {
														dateStyle: "medium",
													}).format(new Date(a.applied_date))}
												</p>
												{a.location && (
													<p>
														<span className="text-muted-foreground/50">
															Location:
														</span>{" "}
														{a.location}
													</p>
												)}
												{a.salary && (
													<p>
														<span className="text-muted-foreground/50">
															Salary:
														</span>{" "}
														<span className="font-mono-num">
															{new Intl.NumberFormat("de-DE", {
																style: "currency",
																currency: "EUR",
															}).format(a.salary)}
														</span>
													</p>
												)}
												{a.source && (
													<p>
														<span className="text-muted-foreground/50">
															Source:
														</span>{" "}
														{a.source}
													</p>
												)}
												{a.job_url && (
													<p>
														<a
															href={a.job_url}
															target="_blank"
															rel="noopener noreferrer"
															className="text-primary hover:underline"
														>
															View job posting &rarr;
														</a>
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
													onEdit={() => {
														setEditing(a);
														setDialogOpen(true);
													}}
													onDelete={() => setDeleteId(a.id)}
												/>
											</div>
										</div>
									);
								})}
							</div>
						</>
					)}
				</CardContent>
			</Card>

			<ApplicationDialog
				open={dialogOpen}
				onOpenChange={(o) => {
					setDialogOpen(o);
					if (!o) setEditing(null);
				}}
				editing={editing}
			/>

			<AlertDialog
				open={deleteId !== null}
				onOpenChange={(o) => !o && setDeleteId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this application?</AlertDialogTitle>
						<AlertDialogDescription>
							This can't be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel data-testid="button-cancel-delete">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							data-testid="button-confirm-delete"
							onClick={() => deleteId && deleteMutation.mutate(deleteId)}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
