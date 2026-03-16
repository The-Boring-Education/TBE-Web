import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCategories = vi.fn();

vi.mock("@tbe/services", () => ({
  quizApi: { getCategories: (...args: any[]) => mockGetCategories(...args) },
}));

import useQuizData from "@tbe/hooks/useQuizData";

describe("useQuizData", () => {
  const mockCategories = [
    { _id: "c1", name: "JavaScript", totalQuestions: 10 },
    { _id: "c2", name: "Python", totalQuestions: 5 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns loading state initially", () => {
    mockGetCategories.mockReturnValue(new Promise(() => {}));
    const { result } = renderHookWithQuery(() => useQuizData());
    expect(result.current.loading).toBe(true);
    expect(result.current.categories).toEqual([]);
  });

  it("returns categories on successful fetch", async () => {
    mockGetCategories.mockResolvedValue({
      status: true,
      data: mockCategories,
    });

    const { result } = renderHookWithQuery(() => useQuizData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.error).toBeNull();
  });

  it("returns categories when success field is used", async () => {
    mockGetCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    const { result } = renderHookWithQuery(() => useQuizData());

    await waitFor(() => {
      expect(result.current.categories).toEqual(mockCategories);
    });
  });

  it("returns empty categories on failed response", async () => {
    mockGetCategories.mockResolvedValue({
      status: false,
      data: null,
    });

    const { result } = renderHookWithQuery(() => useQuizData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.categories).toEqual([]);
  });

  it("returns error message on fetch failure", async () => {
    mockGetCategories.mockRejectedValue(new Error("Network error"));

    const { result } = renderHookWithQuery(() => useQuizData());

    await waitFor(() => {
      expect(result.current.error).toBe("Network error");
    });
  });

  it("provides a refetch function", async () => {
    mockGetCategories.mockResolvedValue({
      status: true,
      data: mockCategories,
    });

    const { result } = renderHookWithQuery(() => useQuizData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe("function");
  });
});
