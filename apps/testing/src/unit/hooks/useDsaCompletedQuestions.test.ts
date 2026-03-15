import { useDsaCompletedQuestions } from "@tbe/hooks";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("useDsaCompletedQuestions", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};

    const mockGetItem = vi.fn((key: string) => store[key] ?? null);
    const mockSetItem = vi.fn((key: string, value: string) => {
      store[key] = value;
    });
    const mockRemoveItem = vi.fn((key: string) => {
      delete store[key];
    });
    const mockClear = vi.fn(() => {
      store = {};
    });

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
        removeItem: mockRemoveItem,
        clear: mockClear,
        get length() {
          return Object.keys(store).length;
        },
        key: (index: number) => Object.keys(store)[index] ?? null,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    store = {};
  });

  it("should return empty completedIds initially when no localStorage data", () => {
    const { result } = renderHook(() => useDsaCompletedQuestions());

    expect(result.current.completedIds).toEqual([]);
    expect(result.current.solvedToday).toBe(0);
  });

  it("should load completed IDs from localStorage", () => {
    store["dsayatra_completed_questions"] = JSON.stringify(["q1", "q2", "q3"]);

    const { result } = renderHook(() => useDsaCompletedQuestions());

    expect(result.current.completedIds).toEqual(["q1", "q2", "q3"]);
  });

  it("should toggle a question to completed", () => {
    const { result } = renderHook(() => useDsaCompletedQuestions());

    act(() => {
      result.current.toggleComplete("q1");
    });

    expect(result.current.completedIds).toContain("q1");
    expect(store["dsayatra_completed_questions"]).toContain("q1");
  });

  it("should toggle a question to incomplete", () => {
    store["dsayatra_completed_questions"] = JSON.stringify(["q1", "q2"]);

    const { result } = renderHook(() => useDsaCompletedQuestions());

    act(() => {
      result.current.toggleComplete("q1");
    });

    expect(result.current.completedIds).not.toContain("q1");
    expect(result.current.completedIds).toContain("q2");
  });

  it("should track solved today count", () => {
    const { result } = renderHook(() => useDsaCompletedQuestions());

    act(() => {
      result.current.toggleComplete("q1");
    });

    expect(result.current.solvedToday).toBe(1);

    act(() => {
      result.current.toggleComplete("q2");
    });

    expect(result.current.solvedToday).toBe(2);
  });

  it("should decrement solved today when uncompleting", () => {
    const { result } = renderHook(() => useDsaCompletedQuestions());

    act(() => {
      result.current.toggleComplete("q1");
    });
    expect(result.current.solvedToday).toBe(1);

    act(() => {
      result.current.toggleComplete("q1");
    });
    expect(result.current.solvedToday).toBe(0);
  });

  it("should use custom storage keys", () => {
    const customKey = "custom_completed";
    const customTodayKey = "custom_today";

    const { result } = renderHook(() =>
      useDsaCompletedQuestions(customKey, customTodayKey),
    );

    act(() => {
      result.current.toggleComplete("q1");
    });

    expect(store[customKey]).toContain("q1");
    expect(store[customTodayKey]).toBeTruthy();
  });

  it("should handle corrupted localStorage data gracefully", () => {
    store["dsayatra_completed_questions"] = "invalid json{{{";

    const { result } = renderHook(() => useDsaCompletedQuestions());

    expect(result.current.completedIds).toEqual([]);
  });

  it("should load today stats from localStorage", () => {
    const todayStr = new Date().toDateString();
    store["dsayatra_today_stats"] = JSON.stringify({
      date: todayStr,
      solvedCount: 5,
    });

    const { result } = renderHook(() => useDsaCompletedQuestions());

    expect(result.current.solvedToday).toBe(5);
  });

  it("should reset today stats if date is different", () => {
    store["dsayatra_today_stats"] = JSON.stringify({
      date: "Mon Jan 01 2024",
      solvedCount: 5,
    });

    const { result } = renderHook(() => useDsaCompletedQuestions());

    expect(result.current.solvedToday).toBe(0);
  });
});
