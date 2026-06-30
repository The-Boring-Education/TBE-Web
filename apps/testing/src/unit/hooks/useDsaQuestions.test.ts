import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** useDsaQuestions only fetches when userId is set (enabled: !!userId). */
vi.mock("../../../../../packages/hooks/src/useUser.ts", () => ({
  default: () => ({
    user: { id: "test-user", isOnboarded: true },
    isAuth: true,
    loading: false,
    isOnboarded: true,
    updateSession: vi.fn(),
  }),
}));

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
    status: true,
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
    expect(result.current.isError).toBe(false);
    expect(result.current.errorMessage).toBe(null);
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

  it("should expose error state when API response status is false", async () => {
    mockSendRequest.mockResolvedValue({
      status: false,
      message: "Invalid duration",
      data: null,
    });

    const { result } = renderHookWithQuery(() => useDsaQuestions());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.errorMessage).toBe("Invalid duration");
    expect(result.current.questions).toEqual([]);
    expect(result.current.rawQuestions).toEqual([]);
  });
});
