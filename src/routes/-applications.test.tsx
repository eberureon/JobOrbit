// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createWrapper } from "../test/test-utils";
import { ApplicationsPage } from "../components/pages/applications";
import type { Application } from "../db/schema";

const mocks = vi.hoisted(() => ({
	listApplications: vi.fn<[], any>(),
	deleteApplication: vi.fn<any, any>(),
	createApplication: vi.fn<any, any>(),
	updateApplication: vi.fn<any, any>(),
}));

vi.mock("../lib/server/applications.functions", () => ({
	listApplications: mocks.listApplications,
	deleteApplication: mocks.deleteApplication,
	createApplication: mocks.createApplication,
	updateApplication: mocks.updateApplication,
}));

const sampleApps: Application[] = [
	{
		id: 1,
		company: "Acme Inc",
		role: "Engineer",
		status: "Applied",
		applied_date: "2026-05-20",
		location: "Remote",
		salary: "$120k",
		source: "LinkedIn",
		job_url: "https://example.com/job/1",
		notes: "",
		created_at: "",
	},
	{
		id: 2,
		company: "Beta Corp",
		role: "Senior Dev",
		status: "Interview",
		applied_date: "2026-05-18",
		location: "Berlin",
		salary: "",
		source: "",
		job_url: "",
		notes: "",
		created_at: "",
	},
];

const Wrapper = createWrapper();

describe("Applications", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.listApplications.mockResolvedValue([]);
	});

	it("renders the page title", async () => {
		render(<ApplicationsPage />, { wrapper: Wrapper });
		expect(
			(await screen.findAllByText("Applications")).length,
		).toBeGreaterThanOrEqual(1);
	});

	it("shows count 0 of 0 when empty", async () => {
		render(<ApplicationsPage />, { wrapper: Wrapper });
		const els = await screen.findAllByTestId("text-app-count");
		expect(els.length).toBeGreaterThanOrEqual(1);
		expect(els[0].textContent).toBe("0");
	});

	it("shows empty state message when no applications", async () => {
		render(<ApplicationsPage />, { wrapper: Wrapper });
		expect(
			(await screen.findAllByText(/No applications yet/i)).length,
		).toBeGreaterThanOrEqual(1);
	});

	it("shows add application button", async () => {
		render(<ApplicationsPage />, { wrapper: Wrapper });
		expect(
			(await screen.findAllByTestId("button-add-application")).length,
		).toBeGreaterThanOrEqual(1);
	});

	it("renders a table when applications exist", async () => {
		mocks.listApplications.mockResolvedValue(sampleApps);
		render(<ApplicationsPage />, { wrapper: Wrapper });
		expect(
			(await screen.findAllByText("Acme Inc")).length,
		).toBeGreaterThanOrEqual(1);
		expect(
			(await screen.findAllByText("Beta Corp")).length,
		).toBeGreaterThanOrEqual(1);
		expect(
			(await screen.findAllByText("Engineer")).length,
		).toBeGreaterThanOrEqual(1);
		expect(
			(await screen.findAllByText("Senior Dev")).length,
		).toBeGreaterThanOrEqual(1);
	});

	it("shows count of filtered and total apps", async () => {
		mocks.listApplications.mockResolvedValue(sampleApps);
		render(<ApplicationsPage />, { wrapper: Wrapper });
		const els = await screen.findAllByTestId("text-app-count");
		expect(els[0].textContent).toBe("2");
	});

	it("renders status badges for each application", async () => {
		mocks.listApplications.mockResolvedValue(sampleApps);
		render(<ApplicationsPage />, { wrapper: Wrapper });
		expect(
			(await screen.findAllByText("Applied")).length,
		).toBeGreaterThanOrEqual(1);
		expect(
			(await screen.findAllByText("Interview")).length,
		).toBeGreaterThanOrEqual(1);
	});

	it("renders edit and delete buttons per row", async () => {
		mocks.listApplications.mockResolvedValue(sampleApps);
		render(<ApplicationsPage />, { wrapper: Wrapper });
		expect(
			(await screen.findAllByTestId("button-edit-1")).length,
		).toBeGreaterThanOrEqual(1);
		expect(
			(await screen.findAllByTestId("button-delete-1")).length,
		).toBeGreaterThanOrEqual(1);
		expect(
			(await screen.findAllByTestId("button-edit-2")).length,
		).toBeGreaterThanOrEqual(1);
		expect(
			(await screen.findAllByTestId("button-delete-2")).length,
		).toBeGreaterThanOrEqual(1);
	});

	it("renders external link when job_url exists", async () => {
		mocks.listApplications.mockResolvedValue(sampleApps);
		render(<ApplicationsPage />, { wrapper: Wrapper });
		expect(
			(await screen.findAllByTestId("link-job-1")).length,
		).toBeGreaterThanOrEqual(1);
	});

	it("shows sort buttons for company, status, and date", async () => {
		mocks.listApplications.mockResolvedValue(sampleApps);
		render(<ApplicationsPage />, { wrapper: Wrapper });
		expect(
			(await screen.findAllByTestId("sort-company")).length,
		).toBeGreaterThanOrEqual(1);
		expect(
			(await screen.findAllByTestId("sort-status")).length,
		).toBeGreaterThanOrEqual(1);
		expect(
			(await screen.findAllByTestId("sort-date")).length,
		).toBeGreaterThanOrEqual(1);
	});

	it("shows no-match message when filter yields empty", async () => {
		mocks.listApplications.mockResolvedValue(sampleApps);
		render(<ApplicationsPage />, { wrapper: Wrapper });

		const searchInput = (await screen.findAllByTestId("input-search"))[0];
		fireEvent.input(searchInput, { target: { value: "ZZZ_NoMatch" } });

		expect(
			(await screen.findAllByText(/No applications match/i)).length,
		).toBeGreaterThanOrEqual(1);
	});

	it("opens dialog when edit button is clicked", async () => {
		mocks.listApplications.mockResolvedValue(sampleApps);
		render(<ApplicationsPage />, { wrapper: Wrapper });

		fireEvent.click((await screen.findAllByTestId("button-edit-1"))[0]);
		expect(
			(await screen.findAllByText("Edit Application")).length,
		).toBeGreaterThanOrEqual(1);
	});

	it("opens dialog when add application button is clicked", async () => {
		mocks.listApplications.mockResolvedValue(sampleApps);
		render(<ApplicationsPage />, { wrapper: Wrapper });

		fireEvent.click(
			(await screen.findAllByTestId("button-add-application"))[0],
		);
		expect(
			(await screen.findAllByText("Add Application")).length,
		).toBeGreaterThanOrEqual(1);
	});
});
