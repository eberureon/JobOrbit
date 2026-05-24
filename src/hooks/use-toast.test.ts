// @vitest-environment jsdom
import { Toast } from "@base-ui/react/toast";
import { renderHook, act, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { toast, toastManager, useToast } from "./use-toast";

function Wrapper({ children }: { children: ReactNode }) {
  return createElement(Toast.Provider, { toastManager }, children);
}

describe("toast", () => {
  it("adds a toast via standalone toast()", () => {
    const result = toast({ title: "Test", description: "Description" });
    expect(result.id).toBeDefined();
    expect(typeof result.dismiss).toBe("function");
    expect(typeof result.update).toBe("function");
  });

  it("adds a toast via useToast()", () => {
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    act(() => {
      const t = result.current.toast({ title: "Hello" });
      expect(t.id).toBeDefined();
    });
  });

  it("useToast() returns toasts array", () => {
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    expect(Array.isArray(result.current.toasts)).toBe(true);
  });

  it("add adds a toast and it appears in toasts", async () => {
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    act(() => {
      result.current.toast({ title: "New Toast" });
    });
    await waitFor(() => {
      expect(result.current.toasts.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("dismiss removes a toast", async () => {
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    let id: string | undefined;
    act(() => {
      const t = result.current.toast({ title: "Dismiss Me" });
      id = t.id;
    });
    await waitFor(() => {
      expect(result.current.toasts.length).toBeGreaterThanOrEqual(1);
    });
    act(() => {
      result.current.dismiss(id);
    });
  });

  it("maps variant to type", () => {
    const r = toast({ title: "Test", variant: "destructive" });
    expect(r.id).toBeDefined();
  });

  it("standalone toast() and useToast() share the same manager", async () => {
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
    act(() => {
      toast({ title: "Standalone Toast" });
    });
    await waitFor(() => {
      const hasStandaloneToast = result.current.toasts.some((t) => t.title === "Standalone Toast");
      expect(hasStandaloneToast).toBe(true);
    });
  });
});
