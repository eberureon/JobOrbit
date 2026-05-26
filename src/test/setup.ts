import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

process.env.DATABASE_URL = ":memory:";

class MockResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}

globalThis.ResizeObserver = MockResizeObserver;

globalThis.matchMedia =
	globalThis.matchMedia ||
	((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: () => {},
		removeEventListener: () => {},
		addListener: () => {},
		removeListener: () => {},
		dispatchEvent: () => false,
	}));

afterEach(() => {
	cleanup();
});

afterEach(async () => {
	const mod = await import("../db/index.ts");
	const { statusHistory, applications, resume } =
		await import("../db/schema.ts");

	mod.db.delete(applications).run();
	mod.db.delete(statusHistory).run();
	mod.db.delete(resume).run();
});
