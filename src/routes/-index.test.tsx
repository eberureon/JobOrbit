// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createWrapper } from "../test/test-utils";
import { DashboardPage } from "../components/pages/dashboard";

const mocks = vi.hoisted(() => ({
  listApplications: vi.fn<[], any>(),
  getStats: vi.fn<[], any>(),
}));

vi.mock("../lib/server/applications.functions", () => ({
  listApplications: mocks.listApplications,
  getStats: mocks.getStats,
}));

const Wrapper = createWrapper();

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listApplications.mockResolvedValue([]);
    mocks.getStats.mockResolvedValue({
      total: 5,
      last7Days: 2,
      last30Days: 4,
      statusBreakdown: {
        Applied: 2,
        Interview: 1,
        Offer: 1,
        Rejected: 1,
        Accepted: 0,
        Withdrawn: 0,
      },
      funnel: { applied: 5, interview: 2, offer: 1, accepted: 0, rejected: 1 },
      timeline: Array.from({ length: 90 }, (_, i) => ({
        date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
        count: 0,
      })),
      topCompanies: [{ company: "Acme Inc", count: 3 }],
    });
  });

  it("renders the page title", async () => {
    render(<DashboardPage />, { wrapper: Wrapper });
    expect(await screen.findByText("Job Application Tracker")).toBeDefined();
  });

  it("renders stat card labels", async () => {
    render(<DashboardPage />, { wrapper: Wrapper });
    expect((await screen.findAllByText("Total Applications")).length).toBeGreaterThanOrEqual(1);
    expect((await screen.findAllByText("Last 7 Days")).length).toBeGreaterThanOrEqual(1);
    expect((await screen.findAllByText("Last 30 Days")).length).toBeGreaterThanOrEqual(1);
    expect((await screen.findAllByText("Active Pipeline")).length).toBeGreaterThanOrEqual(1);
  });

  it("renders the funnel section", async () => {
    render(<DashboardPage />, { wrapper: Wrapper });
    expect((await screen.findAllByText("Success Rate Funnel")).length).toBeGreaterThanOrEqual(1);
  });

  it("renders top companies when stats have data", async () => {
    render(<DashboardPage />, { wrapper: Wrapper });
    expect((await screen.findAllByText("Acme Inc")).length).toBeGreaterThanOrEqual(1);
  });

  it("renders recent applications when data exists", async () => {
    mocks.listApplications.mockResolvedValue([
      {
        id: 1,
        company: "NewCorp",
        role: "Engineer",
        status: "Applied",
        applied_date: "2026-05-20",
        location: "",
        salary: "",
        source: "",
        job_url: "",
        notes: "",
        created_at: "",
      },
    ]);
    render(<DashboardPage />, { wrapper: Wrapper });
    expect((await screen.findAllByText("NewCorp")).length).toBeGreaterThanOrEqual(1);
  });
});
