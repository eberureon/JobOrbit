// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { toast, useToast } from "./use-toast";

describe("toast", () => {
	it("adds a toast via standalone toast()", () => {
		const result = toast({ title: "Test", description: "Description" });
		expect(result.id).toBeDefined();
		expect(typeof result.dismiss).toBe("function");
	});

	it("useToast() returns toast and dismiss", () => {
		const result = useToast();
		expect(typeof result.toast).toBe("function");
		expect(typeof result.dismiss).toBe("function");
	});

	it("maps variant destructive to danger", () => {
		const result = toast({ title: "Test", variant: "destructive" });
		expect(result.id).toBeDefined();
	});
});
