import { describe, it, expect } from "vitest";
import { reducer } from "./use-toast";

const baseToast = {
	id: "1",
	title: "Test",
	description: "Description",
	open: true,
};

describe("reducer", () => {
	it("ADD_TOAST adds a toast to the state", () => {
		const state = { toasts: [] };
		const next = reducer(state, { type: "ADD_TOAST", toast: baseToast });
		expect(next.toasts).toHaveLength(1);
		expect(next.toasts[0].id).toBe("1");
		expect(next.toasts[0].open).toBe(true);
	});

	it("ADD_TOAST respects TOAST_LIMIT (max 1)", () => {
		const state = {
			toasts: [
				{ id: "existing", title: "Existing", description: "", open: true },
			],
		};
		const next = reducer(state, { type: "ADD_TOAST", toast: baseToast });
		expect(next.toasts).toHaveLength(1);
		expect(next.toasts[0].id).toBe("1");
	});

	it("UPDATE_TOAST updates an existing toast by id", () => {
		const state = { toasts: [baseToast] };
		const next = reducer(state, {
			type: "UPDATE_TOAST",
			toast: { id: "1", title: "Updated Title" },
		});
		expect(next.toasts[0].title).toBe("Updated Title");
		expect(next.toasts[0].description).toBe("Description");
	});

	it("UPDATE_TOAST does nothing for unknown id", () => {
		const state = { toasts: [baseToast] };
		const next = reducer(state, {
			type: "UPDATE_TOAST",
			toast: { id: "nonexistent", title: "Nope" },
		});
		expect(next.toasts).toHaveLength(1);
		expect(next.toasts[0].title).toBe("Test");
	});

	it("DISMISS_TOAST sets open=false for a specific toast", () => {
		const state = { toasts: [baseToast] };
		const next = reducer(state, { type: "DISMISS_TOAST", toastId: "1" });
		expect(next.toasts[0].open).toBe(false);
	});

	it("DISMISS_TOAST dismisses all when no toastId", () => {
		const state = {
			toasts: [
				baseToast,
				{ id: "2", title: "Second", description: "", open: true },
			],
		};
		const next = reducer(state, { type: "DISMISS_TOAST" });
		expect(next.toasts.every((t) => t.open === false)).toBe(true);
	});

	it("REMOVE_TOAST removes a specific toast", () => {
		const state = { toasts: [baseToast] };
		const next = reducer(state, { type: "REMOVE_TOAST", toastId: "1" });
		expect(next.toasts).toHaveLength(0);
	});

	it("REMOVE_TOAST removes all toasts when no toastId", () => {
		const state = {
			toasts: [
				baseToast,
				{ id: "2", title: "Second", description: "", open: true },
			],
		};
		const next = reducer(state, { type: "REMOVE_TOAST" });
		expect(next.toasts).toHaveLength(0);
	});

	it("REMOVE_TOAST does nothing for unknown id", () => {
		const state = { toasts: [baseToast] };
		const next = reducer(state, { type: "REMOVE_TOAST", toastId: "999" });
		expect(next.toasts).toHaveLength(1);
	});

	it("returns state unchanged for unknown action type", () => {
		const state = { toasts: [baseToast] };
		const next = reducer(state, { type: "UNKNOWN" } as any);
		expect(next).toEqual(state);
	});
});
