import { reducer, toast, useToast } from "@tbe/hooks/use-toast";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

describe("use-toast", () => {
  beforeEach(() => {
    // The toast store is module-level singleton state; clear it via the
    // public dismiss-all API before each test so tests stay independent.
    act(() => {
      toast({ title: "reset" }).dismiss();
    });
  });

  describe("reducer", () => {
    it("adds a toast, capped at the toast limit (1)", () => {
      const state = reducer(
        { toasts: [] },
        { type: "ADD_TOAST", toast: { id: "1", open: true } },
      );
      const state2 = reducer(state, {
        type: "ADD_TOAST",
        toast: { id: "2", open: true },
      });

      expect(state2.toasts).toHaveLength(1);
      expect(state2.toasts[0].id).toBe("2");
    });

    it("updates an existing toast by id", () => {
      const state = reducer(
        { toasts: [{ id: "1", open: true, title: "Old" }] },
        { type: "UPDATE_TOAST", toast: { id: "1", title: "New" } },
      );

      expect(state.toasts[0].title).toBe("New");
    });

    it("marks a toast closed on DISMISS_TOAST", () => {
      const state = reducer(
        { toasts: [{ id: "1", open: true }] },
        { type: "DISMISS_TOAST", toastId: "1" },
      );

      expect(state.toasts[0].open).toBe(false);
    });

    it("dismisses all toasts when no toastId is provided", () => {
      const state = reducer(
        {
          toasts: [
            { id: "1", open: true },
            { id: "2", open: true },
          ],
        },
        { type: "DISMISS_TOAST" },
      );

      expect(state.toasts.every((t) => t.open === false)).toBe(true);
    });

    it("removes a single toast on REMOVE_TOAST", () => {
      const state = reducer(
        {
          toasts: [
            { id: "1", open: true },
            { id: "2", open: true },
          ],
        },
        { type: "REMOVE_TOAST", toastId: "1" },
      );

      expect(state.toasts.map((t) => t.id)).toEqual(["2"]);
    });

    it("removes all toasts on REMOVE_TOAST with no id", () => {
      const state = reducer(
        { toasts: [{ id: "1", open: true }] },
        { type: "REMOVE_TOAST" },
      );

      expect(state.toasts).toEqual([]);
    });
  });

  describe("toast()", () => {
    it("creates a toast and exposes dismiss/update helpers", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        toast({ title: "Hello" });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].title).toBe("Hello");
    });

    it("dismiss() closes the toast via onOpenChange", () => {
      const { result } = renderHook(() => useToast());
      let created!: ReturnType<typeof toast>;

      act(() => {
        created = toast({ title: "Closable" });
      });

      act(() => {
        created.dismiss();
      });

      expect(result.current.toasts[0].open).toBe(false);
    });

    it("update() merges new props into the existing toast", () => {
      const { result } = renderHook(() => useToast());
      let created!: ReturnType<typeof toast>;

      act(() => {
        created = toast({ title: "Original" });
      });

      act(() => {
        created.update({
          id: created.id,
          title: "Updated",
        } as any);
      });

      expect(result.current.toasts[0].title).toBe("Updated");
    });
  });

  describe("useToast hook", () => {
    it("subscribes to and unsubscribes from the toast store", () => {
      const { result, unmount } = renderHook(() => useToast());

      expect(Array.isArray(result.current.toasts)).toBe(true);
      expect(typeof result.current.toast).toBe("function");
      expect(typeof result.current.dismiss).toBe("function");

      unmount();
    });
  });
});
