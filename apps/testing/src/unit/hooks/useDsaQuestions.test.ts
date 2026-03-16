import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
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

import useDsaQuestions from "@tbe/hooks/useDsaQuestions";
import { sendRequest } from "@tbe/utils";

const mockSendRequest = vi.mocked(sendRequest);

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
    mockSendRequest.mockResolvedValue(mockApiResponse);
  });

  it("should return empty arrays initially", () => {
    mockSendRequest.mockReturnValue(new Promise(() => {}));

    const { result } = renderHookWithQuery(() => useDsaQuestions());

    expect(result.current.questions).toEqual([]);
    expect(result.current.rawQuestions).toEqual([]);
  });

  it("should transform questions after API response", async () => {
    const { result } = renderHookWithQuery(() => useDsaQuestions());

    await waitFor(() => {
      expect(result.current.questions.length).toBe(2);
    });

    expect(result.current.questions[0]!.id).toBe("q1");
    expect(result.current.questions[0]!.name).toBe("Two Sum");
  });

  it("should accept custom limit", async () => {
    const { result } = renderHookWithQuery(() =>
      useDsaQuestions({ limit: 500 }),
    );

    await waitFor(() => {
      expect(result.current.questions).toBeDefined();
    });

    expect(mockSendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("limit=500"),
      }),
    );
  });

  it("should return loading state", () => {
    mockSendRequest.mockReturnValue(new Promise(() => {}));

    const { result } = renderHookWithQuery(() => useDsaQuestions());

    expect(result.current.loading).toBe(true);
  });

  it("should return rawQuestions separate from transformed", async () => {
    const { result } = renderHookWithQuery(() => useDsaQuestions());

    await waitFor(() => {
      expect(result.current.rawQuestions.length).toBe(2);
    });

    expect(result.current.rawQuestions[0]).toEqual(
      mockApiResponse.data.questions[0],
    );
  });
});
