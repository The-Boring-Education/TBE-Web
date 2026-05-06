import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { useDsaQuestionsForTopic } from "@tbe/hooks/useDsaQuestionsForTopic";
import { sendRequest } from "@tbe/utils";

const mockSendRequest = vi.mocked(sendRequest);

describe("useDsaQuestionsForTopic", () => {
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
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSendRequest.mockResolvedValue(mockApiResponse);
  });

  it("should include topic and product context in request params", async () => {
    renderHookWithQuery(() =>
      useDsaQuestionsForTopic("ARRAY", {
        productType: "ONCAMPUS",
        realWorld: "only",
      }),
    );

    await waitFor(() => {
      expect(mockSendRequest).toHaveBeenCalled();
    });

    const call = mockSendRequest.mock.calls[0]?.[0];
    expect(call?.url).toContain("topic=ARRAY");
    expect(call?.url).toContain("productType=ONCAMPUS");
    expect(call?.url).toContain("realWorld=only");
  });

  it("should return transformed questions when response status is true", async () => {
    const { result } = renderHookWithQuery(() =>
      useDsaQuestionsForTopic("ARRAY"),
    );

    await waitFor(() => {
      expect(result.current.questions.length).toBe(1);
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.errorMessage).toBe(null);
    expect(result.current.questions[0]?.name).toBe("Two Sum");
  });

  it("should expose error state when response status is false", async () => {
    mockSendRequest.mockResolvedValue({
      status: false,
      message: "Invalid duration",
      data: null,
    });

    const { result } = renderHookWithQuery(() =>
      useDsaQuestionsForTopic("ARRAY"),
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.errorMessage).toBe("Invalid duration");
    expect(result.current.questions).toEqual([]);
  });

  it("should not fetch when topic is null", async () => {
    const { result } = renderHookWithQuery(() =>
      useDsaQuestionsForTopic(null, { productType: "DSA_YATRA" }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockSendRequest).not.toHaveBeenCalled();
    expect(result.current.isError).toBe(false);
  });
});
