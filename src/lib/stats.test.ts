import { describe, expect, it, vi } from "vitest";
import type { Application } from "../db/schema";
import { computeStats } from "./stats";

function makeApp(overrides: Partial<Application> = {}): Application {
	return {
		id: 1,
		company: "Acme Inc",
		role: "Engineer",
		location: "",
		status: "Applied",
		applied_date: "2026-05-20",
		salary: "",
		source: "",
		job_url: "",
		notes: "",
		created_at: "2026-05-20T00:00:00.000Z",
		...overrides,
	};
}

describe("computeStats", () => {
	it("returns zeros for an empty array", () => {
		const stats = computeStats([]);
		expect(stats.total).toBe(0);
		expect(stats.last7Days).toBe(0);
		expect(stats.last30Days).toBe(0);
		expect(stats.funnel).toEqual({
			applied: 0,
			interview: 0,
			offer: 0,
			accepted: 0,
			rejected: 0,
			withdrawn: 0,
		});
		expect(stats.timeline).toHaveLength(90);
		expect(stats.topCompanies).toEqual([]);
		expect(stats.statusBreakdown).toEqual({
			Applied: 0,
			Interview: 0,
			Offer: 0,
			Rejected: 0,
			Accepted: 0,
			Withdrawn: 0,
		});
	});

	it("counts total applications", () => {
		const apps = [makeApp(), makeApp({ id: 2 })];
		expect(computeStats(apps).total).toBe(2);
	});

	it("computes status breakdown", () => {
		const apps = [
			makeApp({ status: "Applied" }),
			makeApp({ id: 2, status: "Interview" }),
			makeApp({ id: 3, status: "Interview" }),
			makeApp({ id: 4, status: "Offer" }),
			makeApp({ id: 5, status: "Rejected" }),
		];
		const stats = computeStats(apps);
		expect(stats.statusBreakdown).toEqual({
			Applied: 1,
			Interview: 2,
			Offer: 1,
			Rejected: 1,
			Accepted: 0,
			Withdrawn: 0,
		});
	});

	it("computes funnel counts", () => {
		const apps = [
			makeApp({ status: "Applied" }),
			makeApp({ id: 2, status: "Interview" }),
			makeApp({ id: 3, status: "Offer" }),
			makeApp({ id: 4, status: "Accepted" }),
			makeApp({ id: 5, status: "Rejected" }),
		];
		const history = [
			{
				id: 1,
				application_id: 2,
				old_status: "Applied",
				new_status: "Interview",
				changed_at: "2026-05-20T00:00:00.000Z",
			},
			{
				id: 2,
				application_id: 3,
				old_status: "Applied",
				new_status: "Interview",
				changed_at: "2026-05-20T00:00:00.000Z",
			},
			{
				id: 3,
				application_id: 3,
				old_status: "Interview",
				new_status: "Offer",
				changed_at: "2026-05-21T00:00:00.000Z",
			},
			{
				id: 4,
				application_id: 4,
				old_status: "Applied",
				new_status: "Interview",
				changed_at: "2026-05-21T00:00:00.000Z",
			},
			{
				id: 5,
				application_id: 4,
				old_status: "Interview",
				new_status: "Offer",
				changed_at: "2026-05-22T00:00:00.000Z",
			},
			{
				id: 6,
				application_id: 4,
				old_status: "Offer",
				new_status: "Accepted",
				changed_at: "2026-05-23T00:00:00.000Z",
			},
		];
		const stats = computeStats(apps, history);
		expect(stats.funnel).toEqual({
			applied: 5,
			interview: 3,
			offer: 2,
			accepted: 1,
			rejected: 1,
			withdrawn: 0,
		});
	});

	it("counts applications within last 7 and 30 days", () => {
		vi.useFakeTimers();
		const today = "2026-05-24";
		vi.setSystemTime(new Date(`${today}T00:00:00.000Z`));
		const apps = [
			makeApp({ applied_date: today }),
			makeApp({ id: 2, applied_date: "2026-05-20" }),
			makeApp({ id: 3, applied_date: "2026-05-01" }),
			makeApp({ id: 4, applied_date: "2026-04-01" }),
		];
		const stats = computeStats(apps);
		expect(stats.last7Days).toBe(2);
		expect(stats.last30Days).toBe(3);
		vi.useRealTimers();
	});

	it("returns top 5 companies by count", () => {
		const apps = [
			makeApp({ company: "Google" }),
			makeApp({ id: 2, company: "Google" }),
			makeApp({ id: 3, company: "Google" }),
			makeApp({ id: 4, company: "Meta" }),
			makeApp({ id: 5, company: "Meta" }),
			makeApp({ id: 6, company: "Amazon" }),
			makeApp({ id: 7, company: "Apple" }),
			makeApp({ id: 8, company: "Netflix" }),
			makeApp({ id: 9, company: "Microsoft" }),
		];
		const top = computeStats(apps).topCompanies;
		expect(top).toHaveLength(5);
		expect(top[0].company).toBe("Google");
		expect(top[0].count).toBe(3);
	});
});
