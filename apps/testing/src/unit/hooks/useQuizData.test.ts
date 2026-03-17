import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCategories = vi.fn();

vi.mock("@tbe/services", () => ({
  quizApi: {
    getCategories: (...args: unknown[]) => mockGetCategories(...args),
  },
}));

import { useQuizData } from "@tbe/hooks";

const mockCategories = [
  {
    _id: "1",
    categoryName: "JavaScript",
    categoryDescription: "JS Quiz",
    categoryIcon: "js-icon",
  },
  {
    _id: "2",
    categoryName: "React",
    categoryDescription: "React Quiz",
    categoryIcon: "react-icon",
  },
];

describe("useQuizData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts in loading state", () => {
    mockGetCategories.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHookWithQuery(() => useQuizData());

    expect(result.current.loading).toBe(true);
  });

  it("sets categories on successful fetch with success: true", async () => {
    mockGetCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    const { result } = renderHookWithQuery(() => useQuizData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.error).toBe(null);
  });

  it("sets categories on successful fetch with status: true", async () => {
    mockGetCategories.mockResolvedValue({
      status: true,
      data: mockCategories,
    });

    const { result } = renderHookWithQuery(() => useQuizData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.categories).toEqual(mockCategories);
  });

  it("sets error on failed fetch", async () => {
    mockGetCategories.mockRejectedValue(new Error("Network error"));

    const { result } = renderHookWithQuery(() => useQuizData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
  });

  it("sets error when API returns unsuccessful", async () => {
    mockGetCategories.mockResolvedValue({
      success: false,
      status: false,
      message: "Unauthorized",
    });

    const { result } = renderHookWithQuery(() => useQuizData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Unauthorized");
  });

  it("refetch re-fetches categories", async () => {
    mockGetCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    const { result } = renderHookWithQuery(() => useQuizData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockGetCategories.mockResolvedValue({
      success: true,
      data: [
        ...mockCategories,
        {
          _id: "3",
          categoryName: "Node",
          categoryDescription: "Node Quiz",
          categoryIcon: "node-icon",
        },
      ],
    });

    await result.current.refetch();

    await waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalledTimes(2);
      expect(result.current.categories).toHaveLength(3);
    });
  });
});
