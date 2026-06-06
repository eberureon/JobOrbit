import { beforeAll, describe, expect, it } from "vitest";
import { createDb } from "~/db/index";
import { createLockRepo } from "./lock";

let repo: ReturnType<typeof createLockRepo>;

beforeAll(() => {
	const db = createDb(":memory:");
	repo = createLockRepo(db);
});

describe("getLock", () => {
	it("returns a default lock row when none exists", () => {
		const result = repo.getLock();
		expect(result.id).toBe(1);
		expect(result.enabled).toBe(false);
		expect(result.hash).toBeNull();
		expect(result.session_ttl_hours).toBeNull();
	});

	it("returns existing lock row on subsequent calls", () => {
		const first = repo.getLock();
		const second = repo.getLock();
		expect(second).toEqual(first);
	});
});

describe("upsertLock", () => {
	it("updates enabled flag", () => {
		const result = repo.upsertLock({ enabled: true });
		expect(result.enabled).toBe(true);
	});

	it("updates hash", () => {
		const result = repo.upsertLock({ hash: "hashed_password" });
		expect(result.hash).toBe("hashed_password");
	});

	it("updates session_ttl_hours", () => {
		const result = repo.upsertLock({ session_ttl_hours: 24 });
		expect(result.session_ttl_hours).toBe(24);
	});

	it("sets session_ttl_hours to null for forever", () => {
		repo.upsertLock({ session_ttl_hours: 24 });
		const result = repo.upsertLock({ session_ttl_hours: null });
		expect(result.session_ttl_hours).toBeNull();
	});

	it("sets hash to null", () => {
		repo.upsertLock({ hash: "something" });
		const result = repo.upsertLock({ hash: null });
		expect(result.hash).toBeNull();
	});

	it("can enable and set hash in one call", () => {
		const result = repo.upsertLock({
			enabled: true,
			hash: "new_hash",
			session_ttl_hours: 72,
		});
		expect(result.enabled).toBe(true);
		expect(result.hash).toBe("new_hash");
		expect(result.session_ttl_hours).toBe(72);
	});
});
