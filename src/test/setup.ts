import { afterEach } from "vitest";

process.env.DATABASE_URL = ":memory:";

class MockResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}

globalThis.ResizeObserver = MockResizeObserver;

afterEach(async () => {
	const mod = await import("../db/index.ts");
	const { statusHistory, applications, resume } =
		await import("../db/schema.ts");

	mod.db.delete(applications).run();
	mod.db.delete(statusHistory).run();
	mod.db.delete(resume).run();
});
