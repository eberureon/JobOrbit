import { beforeAll, describe, it, expect } from "vitest";
import { createDb } from "~/db/index";
import { createResumeRepo } from "./resume";

let getResume: ReturnType<typeof createResumeRepo>["getResume"];
let upsertResume: ReturnType<typeof createResumeRepo>["upsertResume"];

beforeAll(() => {
	const db = createDb(":memory:");
	const repo = createResumeRepo(db);
	getResume = repo.getResume;
	upsertResume = repo.upsertResume;
});

describe("getResume", () => {
	it("returns a resume with default values when none exists", () => {
		const result = getResume();
		expect(result.id).toBe(1);
		expect(result.full_name).toBe("");
		expect(result.headline).toBe("");
		expect(result.email).toBe("");
		expect(result.phone).toBe("");
		expect(result.location).toBe("");
		expect(result.summary).toBe("");
		expect(result.skills).toBe("[]");
		expect(result.experience).toBe("");
		expect(result.education).toBe("");
		expect(result.links).toBe("[]");
		expect(result.updated_at).toBeDefined();
	});

	it("returns the existing resume after first call", () => {
		const first = getResume();
		const second = getResume();
		expect(second).toEqual(first);
	});
});

describe("upsertResume", () => {
	it("inserts a resume when none exists and returns it", () => {
		const result = upsertResume({
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
		});
		expect(result.id).toBe(1);
		expect(result.full_name).toBe("Jane Doe");
		expect(result.headline).toBe("Senior Engineer");
		expect(result.skills).toBe('["TypeScript","React"]');
		expect(result.updated_at).toBeDefined();
	});

	it("updates an existing resume", () => {
		upsertResume({ full_name: "Original" });
		const updated = upsertResume({
			full_name: "Updated Name",
			headline: "New Headline",
		});
		expect(updated.full_name).toBe("Updated Name");
		expect(updated.headline).toBe("New Headline");
	});

	it("preserves fields not included in update", () => {
		upsertResume({ full_name: "Alice", email: "alice@example.com" });
		const result = upsertResume({ full_name: "Alice Updated" });
		expect(result.full_name).toBe("Alice Updated");
		expect(result.email).toBe("alice@example.com");
	});

	it("rejects invalid data via schema", () => {
		expect(() =>
			upsertResume({ skills: "not-json-array" } as any),
		).not.toThrow();
	});
});
