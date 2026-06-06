import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Papa from "papaparse";
import { useEffect, useMemo, useState } from "react";
import { AlertDialog, Button, Card, CardContent } from "@heroui/react";
import type { Application, StatusHistory } from "~/db/schema";
import { useToast } from "~/hooks/use-toast";
import {
	deleteApplication,
	importApplications,
	importStatusHistory,
	listApplications,
	listStatusHistory,
} from "~/lib/server/applications.functions";
import type { ApplicationStatus, SortOrder, SortKey } from "~/lib/types";
import { SORT_KEY } from "~/lib/types";
import { getEffectiveLocale, useSettings } from "~/lib/use-settings";
import {
	parseCsv,
	parseHistoryCsv,
	mapToApplicationRow,
	mapToHistoryRow,
} from "~/lib/csv";
import { ApplicationActionBar } from "./ApplicationActionBar";
import { ApplicationFilterBar } from "./ApplicationFilterBar";
import { ApplicationsTable } from "./ApplicationsTable";
import { ApplicationDialog } from "./ApplicationDialog";
import { computeApplicationList } from "./applicationList";

function sortFromDefault(d: SortOrder): [SortKey, "asc" | "desc"] {
	switch (d) {
		case "newest":
			return [SORT_KEY.APPLIED_DATE, "desc"];
		case "a-z":
			return [SORT_KEY.COMPANY, "asc"];
		case "follow-up":
			return [SORT_KEY.STATUS, "asc"];
		default:
			return [SORT_KEY.APPLIED_DATE, "desc"];
	}
}

export function ApplicationsPage() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const { settings } = useSettings();

	const appsQuery = useQuery<Application[]>({
		queryKey: ["applications"],
		queryFn: () => listApplications(),
	});
	const historyQuery = useQuery<StatusHistory[]>({
		queryKey: ["status-history"],
		queryFn: () => listStatusHistory(),
	});
	const apps = appsQuery.data ?? [];
	const history = historyQuery.data ?? [];
	const isLoading = appsQuery.isLoading || historyQuery.isLoading;

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<ApplicationStatus>>(
		new Set(),
	);
	const [historyFilter, setHistoryFilter] = useState<Set<ApplicationStatus>>(
		new Set(),
	);
	const [sortKey, setSortKey] = useState<SortKey>(
		sortFromDefault(settings.defaultSort)[0],
	);
	const [sortDir, setSortDir] = useState<"asc" | "desc">(
		sortFromDefault(settings.defaultSort)[1],
	);
	const [page, setPage] = useState(0);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<Application | null>(null);
	const [deleteId, setDeleteId] = useState<number | null>(null);

	const locale = getEffectiveLocale(settings);

	const { filtered, paginated, totalPages, safePage } = useMemo(
		() =>
			computeApplicationList({
				apps,
				history,
				search,
				statusFilter,
				historyFilter,
				sortKey,
				sortDir,
				page,
				pageSize: settings.pageSize,
			}),
		[
			apps,
			history,
			search,
			statusFilter,
			historyFilter,
			sortKey,
			sortDir,
			page,
			settings.pageSize,
		],
	);

	useEffect(() => {
		setPage(0);
	}, [search, statusFilter, historyFilter, sortKey, sortDir]);

	const pageSize = settings.pageSize;

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

	function handleDelete(id: number) {
		if (settings.askBeforeDelete) {
			setDeleteId(id);
		} else {
			deleteMutation.mutate(id);
		}
	}

	const importMutation = useMutation({
		mutationFn: async (file: File) => {
			const text = await file.text();
			const data = parseCsv(text);

			const rowErrors: { row: number; reason: string }[] = [];
			const validRows: Parameters<
				typeof importApplications
			>[0]["data"]["rows"] = [];
			for (let i = 0; i < data.length; i++) {
				const result = mapToApplicationRow(data[i], i + 2);
				if (result.error) {
					rowErrors.push(result.error);
				} else {
					validRows.push(result.data);
				}
			}

			if (validRows.length === 0 && rowErrors.length === 0) {
				throw new Error("CSV file is empty or has no valid rows.");
			}

			const resp = await importApplications({ data: { rows: validRows } });
			return { imported: resp.count, total: data.length, errors: rowErrors };
		},
		onSuccess: ({ imported, total, errors }) => {
			queryClient.invalidateQueries({ queryKey: ["applications"] });
			queryClient.invalidateQueries({ queryKey: ["stats"] });
			const skipped = total - imported;
			if (skipped === 0) {
				toast({
					title: "Import complete",
					description: `Imported ${imported} application${imported === 1 ? "" : "s"}.`,
				});
			} else {
				const detail = errors
					.slice(0, 3)
					.map((e) => `Row ${e.row}: ${e.reason}`)
					.join("\n");
				toast({
					title: "Import complete",
					description: `Imported ${imported} of ${total}. ${skipped} row${skipped === 1 ? "" : "s"} skipped.`,
				});
				if (detail) {
					toast({
						title: "Skipped rows",
						description: detail,
						variant: "destructive",
					});
				}
			}
		},
		onError: (e: Error) =>
			toast({
				title: "Import failed",
				description: e.message,
				variant: "destructive",
			}),
	});

	const importHistoryMutation = useMutation({
		mutationFn: async (file: File) => {
			const text = await file.text();
			const data = parseHistoryCsv(text);

			const rowErrors: { row: number; reason: string }[] = [];
			const validRows: {
				application_id: number;
				old_status: string | null;
				new_status: string;
			}[] = [];
			for (let i = 0; i < data.length; i++) {
				const result = mapToHistoryRow(data[i], i + 2);
				if (result.error) {
					rowErrors.push(result.error);
				} else if (result.data) {
					validRows.push(result.data);
				}
			}

			if (validRows.length === 0 && rowErrors.length === 0) {
				throw new Error("CSV file is empty or has no valid rows.");
			}

			const resp = await importStatusHistory({ data: { rows: validRows } });
			return {
				imported: resp.count,
				skipped: resp.skipped,
				total: data.length,
				errors: rowErrors,
			};
		},
		onSuccess: ({ imported, skipped, errors }) => {
			queryClient.invalidateQueries({ queryKey: ["status-history"] });
			toast({
				title: "Import complete",
				description: `Imported ${imported} history entr${imported === 1 ? "y" : "ies"}. ${skipped} row${skipped === 1 ? "" : "s"} skipped.`,
			});
			if (errors.length > 0) {
				const detail = errors
					.slice(0, 3)
					.map((e) => `Row ${e.row}: ${e.reason}`)
					.join("\n");
				toast({
					title: "Skipped rows",
					description: detail,
					variant: "destructive",
				});
			}
		},
		onError: (e: Error) =>
			toast({
				title: "Import failed",
				description: e.message,
				variant: "destructive",
			}),
	});

	function handleExportHistory() {
		const rows = history.map((h) => ({
			"Application ID": h.application_id,
			"Old Status": h.old_status ?? "",
			"New Status": h.new_status,
			"Changed At": h.changed_at,
		}));
		const csv = Papa.unparse(rows);
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "status-history.csv";
		link.click();
		URL.revokeObjectURL(url);
	}

	function handleExportCsv() {
		const rows = filtered.map((a) => ({
			Company: a.company,
			Role: a.role,
			Location: a.location,
			Status: a.status,
			"Applied Date": a.applied_date,
			Salary: a.salary,
			Source: a.source,
			"Job URL": a.job_url,
			Notes: a.notes,
		}));
		const csv = Papa.unparse(rows);
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "applications.csv";
		link.click();
		URL.revokeObjectURL(url);
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div className="col-span-1">
					<h1 className="text-xl font-semibold tracking-tight text-foreground">
						Applications
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						<span className="font-mono-num" data-testid="text-app-count">
							{filtered.length}
						</span>{" "}
						of {apps.length} shown
						{apps.length > pageSize && (
							<span className="ml-2 text-muted-foreground/60">
								&middot; Page {safePage + 1} of {totalPages}
							</span>
						)}
					</p>
				</div>
				<ApplicationActionBar
					onAddApplication={() => {
						setEditing(null);
						setDialogOpen(true);
					}}
					onExportCsv={handleExportCsv}
					onExportHistory={handleExportHistory}
					onImportCsv={(file) => importMutation.mutate(file)}
					onImportHistory={(file) => importHistoryMutation.mutate(file)}
					isImportingCsv={importMutation.isPending}
					isImportingHistory={importHistoryMutation.isPending}
				/>
			</div>

			<Card className="card-hairline border">
				<CardContent className="flex gap-3 flex-row flex-wrap items-center">
					<ApplicationFilterBar
						search={search}
						onSearchChange={setSearch}
						statusFilter={statusFilter}
						onStatusFilterChange={setStatusFilter}
						historyFilter={historyFilter}
						onHistoryFilterChange={setHistoryFilter}
					/>
				</CardContent>
			</Card>

			<Card className="card-hairline border p-0 overflow-hidden">
				<CardContent className="p-0">
					<ApplicationsTable
						applications={paginated}
						isLoading={isLoading}
						locale={locale}
						sortKey={sortKey}
						sortDir={sortDir}
						onSort={toggleSort}
						onRowClick={(a) => {
							setEditing(a);
							setDialogOpen(true);
						}}
						onEdit={(a) => {
							setEditing(a);
							setDialogOpen(true);
						}}
						onDelete={(a) => handleDelete(a.id)}
						emptyMessage={
							apps.length === 0
								? 'No applications yet. Click "Add Application" to get started.'
								: "No applications match your filters."
						}
					/>
				</CardContent>
			</Card>

			{totalPages > 1 && (
				<div
					className="flex items-center justify-center gap-2"
					data-testid="pagination"
				>
					<Button
						variant="outline"
						size="sm"
						isDisabled={safePage === 0}
						onPress={() => setPage(safePage - 1)}
						data-testid="button-page-prev"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					{Array.from({ length: totalPages }, (_, i) => (
						<Button
							key={i}
							variant={i === safePage ? "primary" : "outline"}
							size="sm"
							className="min-w-8"
							onPress={() => setPage(i)}
							data-testid={`button-page-${i + 1}`}
						>
							{i + 1}
						</Button>
					))}
					<Button
						variant="outline"
						size="sm"
						isDisabled={safePage >= totalPages - 1}
						onPress={() => setPage(safePage + 1)}
						data-testid="button-page-next"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			)}

			<ApplicationDialog
				open={dialogOpen}
				onOpenChange={(o) => {
					setDialogOpen(o);
					if (!o) setEditing(null);
				}}
				editing={editing}
			/>

			<AlertDialog.Backdrop
				isOpen={deleteId !== null}
				onOpenChange={(o) => !o && setDeleteId(null)}
			>
				<AlertDialog.Container>
					<AlertDialog.Dialog className="sm:max-w-100">
						<AlertDialog.Header>
							<AlertDialog.Heading>
								Delete this application?
							</AlertDialog.Heading>
						</AlertDialog.Header>
						<AlertDialog.Body>
							<p>This can't be undone.</p>
						</AlertDialog.Body>
						<AlertDialog.Footer>
							<Button
								slot="close"
								variant="tertiary"
								data-testid="button-cancel-delete"
							>
								Cancel
							</Button>
							<Button
								slot="close"
								variant="danger"
								data-testid="button-confirm-delete"
								onPress={() => deleteId && deleteMutation.mutate(deleteId)}
							>
								Delete
							</Button>
						</AlertDialog.Footer>
					</AlertDialog.Dialog>
				</AlertDialog.Container>
			</AlertDialog.Backdrop>
		</div>
	);
}
