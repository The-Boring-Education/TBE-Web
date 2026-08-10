import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/utils", () => ({
  sendRequest: vi.fn(),
}));

import { useStudyGuideTopic } from "@tbe/hooks/useStudyGuide";
import { sendRequest } from "@tbe/utils";

const mockSendRequest = vi.mocked(sendRequest);

describe("useStudyGuideTopic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not fetch when topicId is empty", () => {
    renderHookWithQuery(() => useStudyGuideTopic(""));

    expect(mockSendRequest).not.toHaveBeenCalled();
  });

  it("normalizes the topic id and returns the study guide data", async () => {
    mockSendRequest.mockResolvedValue({
      status: true,
      data: { topic: "ARRAYS_AND_HASHING", content: "..." },
    });

    const { result } = renderHookWithQuery(() =>
      useStudyGuideTopic("arrays and hashing"),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: expect.stringContaining("ARRAYS_AND_HASHING"),
      }),
    );
    expect(result.current.data).toEqual({
      topic: "ARRAYS_AND_HASHING",
      content: "...",
    });
  });

  it("throws when the API responds with status: false", async () => {
    mockSendRequest.mockResolvedValue({
      status: false,
      message: "Study guide not found",
    });

    const { result } = renderHookWithQuery(() =>
      useStudyGuideTopic("unknown-topic"),
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(
      "Study guide not found",
    );
  });
});
