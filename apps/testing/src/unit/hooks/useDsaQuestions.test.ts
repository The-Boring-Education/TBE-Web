import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/utils", () => ({
  sendRequest: vi.fn(),
  transformDsaQuestion: vi.fn((q: any) => ({
    id: q._id,
    name: q.title,
    difficultyLevel: q.difficulty,
    answer: q.answer || "",
    topics: q.topics || [],
    resources: q.resources || {},
    examples: [],
    constraints: [],
  })),
}));

const mockFetchQuery = vi.fn();
vi.mock("react-query", () => ({
  useQueryClient: () => ({
    fetchQuery: mockFetchQuery,
  }),
}));

import { useDsaQuestions } from "@tbe/hooks";

describe("useDsaQuestions", () => {
  const mockApiResponse = {
    data: {
      questions: [
        {
          _id: "q1",
          title: "Two Sum",
          difficulty: "EASY",
          topics: ["ARRAY"],
          answer: "Use hashmap",
        },
        {
          _id: "q2",
          title: "Binary Search",
          difficulty: "MEDIUM",
          topics: ["BINARY_SEARCH"],
          answer: "Divide and conquer",
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchQuery.mockResolvedValue(mockApiResponse);
  });

  it("should return empty arrays initially", () => {
    mockFetchQuery.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useDsaQuestions());

    expect(result.current.questions).toEqual([]);
    expect(result.current.rawQuestions).toEqual([]);
  });

  it("should transform questions after API response", async () => {
    const { result } = renderHook(() => useDsaQuestions());

    await waitFor(() => {
      expect(result.current.questions.length).toBeGreaterThanOrEqual(0);
    });
  });

  it("should accept custom queryKey", () => {
    const { result } = renderHook(() =>
      useDsaQuestions({ queryKey: "custom-key" }),
    );

    expect(result.current.questions).toBeDefined();
    expect(result.current.rawQuestions).toBeDefined();
    expect(result.current.loading).toBeDefined();
  });

  it("should accept custom limit", () => {
    const { result } = renderHook(() => useDsaQuestions({ limit: 500 }));

    expect(result.current.questions).toBeDefined();
  });
});
