import Papa from "papaparse";
import { insertApplicationSchema } from "~/db/schema";
import { APPLICATION_STATUSES, type ApplicationStatus } from "~/lib/types";
import { toLocalDateString } from "~/lib/date";

const CSV_COLUMN_MAP: Record<string, string> = {
	company: "company",
	role: "role",
	location: "location",
	status: "status",
	salary: "salary",
	source: "source",
	joburl: "job_url",
	notes: "notes",
	applieddate: "applied_date",
	applied_date: "applied_date",
	"applied date": "applied_date",
};

export type CsvRowError = { row: number; reason: string };

export function parseCsv(text: string): Record<string, string>[] {
	const { data } = Papa.parse<Record<string, string>>(text, {
		header: true,
		skipEmptyLines: true,
		dynamicTyping: false,
	});
	return data;
}

export function parseHistoryCsv(text: string): Record<string, unknown>[] {
	const { data } = Papa.parse<Record<string, unknown>>(text, {
		header: true,
		skipEmptyLines: true,
		dynamicTyping: true,
	});
	return data;
}

export function mapToApplicationRow(
	record: Record<string, string>,
	rowNum: number,
	today?: string,
): {
	data: ReturnType<typeof insertApplicationSchema.parse>;
	error?: CsvRowError;
} {
	const resolvedToday = today ?? toLocalDateString(new Date());
	const mapped: Record<string, string> = {};

	for (const [key, value] of Object.entries(record)) {
		const dbKey = CSV_COLUMN_MAP[key.toLowerCase()];
		if (dbKey) mapped[dbKey] = value ?? "";
	}

	let status = mapped.status ?? "";
	if (!APPLICATION_STATUSES.includes(status as ApplicationStatus)) {
		status = "Applied";
	}

	let appliedDate = mapped.applied_date ?? "";
	if (!/^\d{4}-\d{2}-\d{2}$/.test(appliedDate)) {
		appliedDate = resolvedToday;
	}

	const rowData = {
		company: mapped.company ?? "",
		role: mapped.role ?? "",
		location: mapped.location ?? "",
		status,
		applied_date: appliedDate,
		salary: mapped.salary ?? "",
		source: mapped.source ?? "",
		job_url: mapped.job_url ?? "",
		notes: mapped.notes ?? "",
	};

	const result = insertApplicationSchema.safeParse(rowData);
	if (result.success) {
		return { data: result.data };
	}
	return {
		data: rowData as never,
		error: {
			row: rowNum,
			reason: result.error.errors.map((e) => e.message).join("; "),
		},
	};
}

export function mapToHistoryRow(
	record: Record<string, unknown>,
	rowNum: number,
): {
	data?: {
		application_id: number;
		old_status: string | null;
		new_status: string;
	};
	error?: CsvRowError;
} {
	const appId = Number(
		record.application_id ?? record["Application ID"] ?? record.applicationId,
	);
	if (Number.isNaN(appId) || appId <= 0) {
		return {
			error: { row: rowNum, reason: "Invalid or missing application_id" },
		};
	}

	const newStatus = String(
		record.new_status ?? record["New Status"] ?? record.newStatus ?? "",
	);
	if (!APPLICATION_STATUSES.includes(newStatus as ApplicationStatus)) {
		return {
			error: { row: rowNum, reason: `Invalid new_status: "${newStatus}"` },
		};
	}

	const rawOld =
		record.old_status ?? record["Old Status"] ?? record.oldStatus ?? null;
	const oldStatus = rawOld ? String(rawOld) : null;
	if (
		oldStatus &&
		!APPLICATION_STATUSES.includes(oldStatus as ApplicationStatus)
	) {
		return {
			error: { row: rowNum, reason: `Invalid old_status: "${oldStatus}"` },
		};
	}

	return {
		data: {
			application_id: appId,
			old_status: oldStatus,
			new_status: newStatus,
		},
	};
}
