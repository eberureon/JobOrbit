import type { Application, StatusHistory } from "~/db/schema";
import type { ApplicationStatus, SortKey } from "~/lib/types";

type ApplicationListInput = {
	apps: Application[];
	history: StatusHistory[];
	search: string;
	statusFilter: Set<ApplicationStatus>;
	historyFilter: Set<ApplicationStatus>;
	sortKey: SortKey;
	sortDir: "asc" | "desc";
	page: number;
	pageSize: number;
};

type ApplicationListOutput = {
	filtered: Application[];
	paginated: Application[];
	totalPages: number;
	safePage: number;
};

export function computeApplicationList({
	apps,
	history,
	search,
	statusFilter,
	historyFilter,
	sortKey,
	sortDir,
	page,
	pageSize,
}: ApplicationListInput): ApplicationListOutput {
	let list = [...apps];
	if (search.trim()) {
		const q = search.toLowerCase();
		list = list.filter(
			(a) =>
				a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q),
		);
	}
	if (statusFilter.size > 0) {
		list = list.filter((a) => statusFilter.has(a.status as ApplicationStatus));
	}
	if (historyFilter.size > 0) {
		const historyMatches = new Set<number>();
		for (const entry of history) {
			if (historyFilter.has(entry.new_status as ApplicationStatus)) {
				historyMatches.add(entry.application_id);
			}
		}
		list = list.filter((a) => historyMatches.has(a.id));
	}
	list.sort((a, b) => {
		const av = (a as Record<string, unknown>)[sortKey];
		const bv = (b as Record<string, unknown>)[sortKey];
		if (av < bv) return sortDir === "asc" ? -1 : 1;
		if (av > bv) return sortDir === "asc" ? 1 : -1;
		return 0;
	});

	const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
	const safePage = Math.min(page, totalPages - 1);
	const paginated = list.slice(safePage * pageSize, (safePage + 1) * pageSize);

	return { filtered: list, paginated, totalPages, safePage };
}
