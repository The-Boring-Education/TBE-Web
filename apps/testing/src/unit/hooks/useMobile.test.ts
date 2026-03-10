import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "@tbe/hooks";

describe("useIsMobile Hook", () => {
  beforeEach(() => {
    // Reset window.innerWidth
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should return false for desktop width", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });

    it("should return true for mobile width", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it("should return false for width at breakpoint (768)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { result } = renderHook(() => useIsMobile());
      // 768 is not < 768, so should be false
      expect(result.current).toBe(false);
    });
  });

  describe("Resize Handling", () => {
    it("should update when window is resized to mobile", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);

      // Simulate resize to mobile
      act(() => {
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: 500,
        });
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current).toBe(true);
    });

    it("should update when window is resized to desktop", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);

      // Simulate resize to desktop
      act(() => {
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: 1024,
        });
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current).toBe(false);
    });
  });

  describe("Cleanup", () => {
    it("should remove event listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
      const { unmount } = renderHook(() => useIsMobile());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "resize",
        expect.any(Function),
      );
    });
  });
});
