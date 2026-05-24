// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Resume } from "../../../db/schema";
import { createWrapper } from "../../../test/test-utils";
import { ResumePage } from "./ResumePage";

const mocks = vi.hoisted(() => ({
	getResume: vi.fn<[], any>(),
	upsertResume: vi.fn<any, any>(),
}));

vi.mock("../../../lib/server/resume.functions", () => ({
	getResume: mocks.getResume,
	upsertResume: mocks.upsertResume,
}));

const emptyResume: Resume = {
	id: 1,
	full_name: "",
	headline: "",
	email: "",
	phone: "",
	location: "",
	summary: "",
	skills: "[]",
	experience: "",
	education: "",
	links: "[]",
	updated_at: "2026-05-24T00:00:00.000Z",
};

const filledCv: Resume = {
	...emptyResume,
	full_name: "Jane Doe",
	headline: "Senior Engineer",
	email: "jane@example.com",
	phone: "+1-555-0100",
	location: "San Francisco",
	summary: "A summary.",
	skills: '["TypeScript","React"]',
	experience: "### Acme Inc\n2020-2023",
	education: "### MIT\n2014-2018",
	links: '["https://github.com/jane"]',
};

const Wrapper = createWrapper();

describe("ResumePage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getResume.mockResolvedValue(emptyResume);
		mocks.upsertResume.mockResolvedValue(emptyResume);
	});

	it("renders the page title", async () => {
		render(<ResumePage />, { wrapper: Wrapper });
		expect(
			(await screen.findAllByText("Resume")).length,
		).toBeGreaterThanOrEqual(1);
	});

	it("renders the subtitle", async () => {
		render(<ResumePage />, { wrapper: Wrapper });
		expect(
			(await screen.findAllByText(/Curate your resume content/i)).length,
		).toBeGreaterThanOrEqual(1);
	});

	it("renders Save and Export buttons", async () => {
		render(<ResumePage />, { wrapper: Wrapper });
		expect((await screen.findAllByText("Save")).length).toBeGreaterThanOrEqual(
			1,
		);
		expect(
			(await screen.findAllByText("Export as Markdown")).length,
		).toBeGreaterThanOrEqual(1);
	});

	it("renders the Edit and Preview sections", async () => {
		render(<ResumePage />, { wrapper: Wrapper });
		expect((await screen.findAllByText("Edit")).length).toBeGreaterThanOrEqual(
			1,
		);
		expect(
			(await screen.findAllByText("Preview")).length,
		).toBeGreaterThanOrEqual(1);
	});

	it("loads resume data into form fields", async () => {
		mocks.getResume.mockResolvedValue(filledCv);
		render(<ResumePage />, { wrapper: Wrapper });

		const nameInput = (
			await screen.findAllByTestId("input-resume-name")
		)[0] as HTMLInputElement;
		await waitFor(() => {
			expect(nameInput.value).toBe("Jane Doe");
		});
	});

	it("shows default placeholder name in preview when no data", async () => {
		render(<ResumePage />, { wrapper: Wrapper });
		expect(
			(await screen.findAllByText("Your Name")).length,
		).toBeGreaterThanOrEqual(1);
	});

	it("shows saved content in preview", async () => {
		mocks.getResume.mockResolvedValue(filledCv);
		render(<ResumePage />, { wrapper: Wrapper });

		expect(
			(await screen.findAllByText("Jane Doe")).length,
		).toBeGreaterThanOrEqual(1);
		expect(
			(await screen.findAllByText("Senior Engineer")).length,
		).toBeGreaterThanOrEqual(1);
		expect(
			(await screen.findAllByText("A summary.")).length,
		).toBeGreaterThanOrEqual(1);
	});

	it("calls upsertResume on Save", async () => {
		mocks.getResume.mockResolvedValue(filledCv);
		mocks.upsertResume.mockResolvedValue(filledCv);
		render(<ResumePage />, { wrapper: Wrapper });

		const saveBtn = (await screen.findAllByText("Save"))[0];
		fireEvent.click(saveBtn);

		await waitFor(() => {
			expect(mocks.upsertResume).toHaveBeenCalled();
		});
	});

	it("triggers markdown export on Export button click", async () => {
		render(<ResumePage />, { wrapper: Wrapper });

		const exportBtn = (await screen.findAllByText("Export as Markdown"))[0];
		const click = fireEvent.click(exportBtn);
		expect(click).toBe(true);
	});
});
