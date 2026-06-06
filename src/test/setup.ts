import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

class MockResizeObserver {
	private callback: ResizeObserverCallback;
	constructor(callback: ResizeObserverCallback) {
		this.callback = callback;
	}
	observe(target: Element) {
		const rect = target.getBoundingClientRect();
		const hasSize = rect.width > 0 || rect.height > 0;
		this.callback(
			[
				{
					contentRect: hasSize
						? rect
						: ({ width: 100, height: 100, top: 0, left: 0 } as DOMRectReadOnly),
					target,
				} as ResizeObserverEntry,
			],
			this as unknown as ResizeObserver,
		);
	}
	unobserve() {}
	disconnect() {}
}

globalThis.ResizeObserver = MockResizeObserver;

if (!globalThis.CSS?.escape) {
	(globalThis.CSS as any) = globalThis.CSS || {};
	(globalThis.CSS as any).escape = (s: string) =>
		s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
