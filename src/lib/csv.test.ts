import { describe, it, expect } from "vitest";
import {
	parseCsv,
	parseHistoryCsv,
	mapToApplicationRow,
	mapToHistoryRow,
} from "./csv";

describe("parseCsv", () => {
	it("parses semicolon-delimited CSV into records", () => {
		const csv =
			"company;role;location\nAcme Inc;Engineer;Remote\nBeta Corp;Dev;Berlin";
		const result = parseCsv(csv);
		expect(result).toHaveLength(2);
		expect(result[0].company).toBe("Acme Inc");
		expect(result[0].role).toBe("Engineer");
		expect(result[0].location).toBe("Remote");
		expect(result[1].company).toBe("Beta Corp");
	});
});

describe("mapToApplicationRow", () => {
	it("maps a valid row correctly", () => {
		const record = {
			company: "Acme Inc",
			role: "Engineer",
			location: "Remote",
			status: "Applied",
			applied_date: "2026-05-20",
		};
		const result = mapToApplicationRow(record, 2);
		expect(result.error).toBeUndefined();
		expect(result.data.company).toBe("Acme Inc");
		expect(result.data.role).toBe("Engineer");
		expect(result.data.status).toBe("Applied");
	});

	it("defaults missing status to Applied", () => {
		const record = { company: "Acme Inc", role: "Engineer" };
		const result = mapToApplicationRow(record, 2);
		expect(result.data.status).toBe("Applied");
	});

	it("defaults invalid status to Applied", () => {
		const record = {
			company: "Acme Inc",
			role: "Engineer",
			status: "BadStatus",
		};
		const result = mapToApplicationRow(record, 2);
		expect(result.data.status).toBe("Applied");
	});

	it("maps jobUrl and Notes columns case-insensitively", () => {
		const record = {
			company: "Some Corp",
			role: "Dev",
			jobUrl: "https://job.com",
			Notes: "My note",
		};
		const result = mapToApplicationRow(record, 2);
		expect(result.data.job_url).toBe("https://job.com");
		expect(result.data.notes).toBe("My note");
	});

	it("uses applied_date when valid", () => {
		const record = {
			company: "Some Corp",
			role: "Dev",
			applied_date: "2026-01-15",
		};
		const result = mapToApplicationRow(record, 2);
		expect(result.data.applied_date).toBe("2026-01-15");
	});

	it("defaults invalid applied_date to today", () => {
		const record = {
			company: "Some Corp",
			role: "Dev",
			applied_date: "not-a-date",
		};
		const result = mapToApplicationRow(record, 2);
		expect(result.data.applied_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	it("returns error row number on validation failure", () => {
		const record = { company: "", role: "Dev" };
		const result = mapToApplicationRow(record, 2);
		expect(result.error).toBeDefined();
		expect(result.error!.row).toBe(2);
	});
});

describe("mapToHistoryRow", () => {
	it("maps a valid history row", () => {
		const record = {
			application_id: 1,
			new_status: "Interview",
			old_status: "Applied",
		};
		const result = mapToHistoryRow(record, 2);
		expect(result.error).toBeUndefined();
		expect(result.data!.application_id).toBe(1);
		expect(result.data!.new_status).toBe("Interview");
		expect(result.data!.old_status).toBe("Applied");
	});

	it("accepts alternate column names", () => {
		const record = {
			"Application ID": "1",
			"New Status": "Offer",
			"Old Status": "Interview",
		};
		const result = mapToHistoryRow(record, 2);
		expect(result.data!.application_id).toBe(1);
		expect(result.data!.new_status).toBe("Offer");
	});

	it("rejects missing application_id", () => {
		const record = { new_status: "Interview" };
		const result = mapToHistoryRow(record, 2);
		expect(result.error).toBeDefined();
		expect(result.error!.reason).toContain("application_id");
	});

	it("rejects invalid new_status", () => {
		const record = { application_id: 1, new_status: "Invalid" };
		const result = mapToHistoryRow(record, 2);
		expect(result.error).toBeDefined();
		expect(result.error!.reason).toContain("new_status");
	});
});

describe("parseHistoryCsv", () => {
	it("parses history CSV with dynamic typing", () => {
		const csv =
			"application_id;new_status;old_status\n1;Interview;Applied\n2;Offer;Interview";
		const result = parseHistoryCsv(csv);
		expect(result).toHaveLength(2);
		expect(Number(result[0].application_id)).toBe(1);
	});
});
