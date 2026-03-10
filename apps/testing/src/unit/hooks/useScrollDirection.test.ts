import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useScrollDirection from "@tbe/hooks/useScrollDirection";

describe("useScrollDirection Hook", () => {
  beforeEach(() => {
    // Reset window.scrollY
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should return null direction initially", () => {
      const { result } = renderHook(() => useScrollDirection());
      expect(result.current.scrollDirection).toBe(null);
      expect(result.current.isVisible).toBe(true);
    });
  });

  describe("Scroll Direction Detection", () => {
    it("should detect downward scroll", () => {
      const { result } = renderHook(() => useScrollDirection());

      act(() => {
        Object.defineProperty(window, "scrollY", {
          writable: true,
          configurable: true,
          value: 200,
        });
        window.dispatchEvent(new Event("scroll"));
      });

      expect(result.current.scrollDirection).toBe("down");
    });

    it("should detect upward scroll", () => {
      // First scroll down
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 200,
      });

      const { result } = renderHook(() => useScrollDirection());

      act(() => {
        window.dispatchEvent(new Event("scroll"));
      });

      expect(result.current.scrollDirection).toBe("down");

      // Then scroll up
      act(() => {
        Object.defineProperty(window, "scrollY", {
          writable: true,
          configurable: true,
          value: 100,
        });
        window.dispatchEvent(new Event("scroll"));
      });

      expect(result.current.scrollDirection).toBe("up");
    });
  });

  describe("Visibility Logic", () => {
    it("should be visible when scrollY is below threshold", () => {
      const { result } = renderHook(() => useScrollDirection(100));

      act(() => {
        Object.defineProperty(window, "scrollY", {
          writable: true,
          configurable: true,
          value: 50,
        });
        window.dispatchEvent(new Event("scroll"));
      });

      expect(result.current.isVisible).toBe(true);
    });

    it("should hide when scrolling down past threshold", () => {
      const { result } = renderHook(() => useScrollDirection(100));

      act(() => {
        Object.defineProperty(window, "scrollY", {
          writable: true,
          configurable: true,
          value: 150,
        });
        window.dispatchEvent(new Event("scroll"));
      });

      expect(result.current.isVisible).toBe(false);
    });

    it("should show when scrolling up after being past threshold", () => {
      const { result } = renderHook(() => useScrollDirection(100));

      // Scroll down past threshold
      act(() => {
        Object.defineProperty(window, "scrollY", {
          writable: true,
          configurable: true,
          value: 150,
        });
        window.dispatchEvent(new Event("scroll"));
      });
      expect(result.current.isVisible).toBe(false);

      // Scroll up
      act(() => {
        Object.defineProperty(window, "scrollY", {
          writable: true,
          configurable: true,
          value: 120,
        });
        window.dispatchEvent(new Event("scroll"));
      });

      expect(result.current.isVisible).toBe(true);
    });
  });

  describe("Threshold Parameter", () => {
    it("should use custom threshold value", () => {
      const { result } = renderHook(() => useScrollDirection(200));

      act(() => {
        Object.defineProperty(window, "scrollY", {
          writable: true,
          configurable: true,
          value: 150,
        });
        window.dispatchEvent(new Event("scroll"));
      });

      // Should still be visible at 150 when threshold is 200
      expect(result.current.isVisible).toBe(true);
    });
  });

  describe("Cleanup", () => {
    it("should remove scroll event listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
      const { unmount } = renderHook(() => useScrollDirection());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function),
      );
    });
  });
});
