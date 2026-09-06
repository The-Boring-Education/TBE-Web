import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/utils", () => ({
  sendRequest: vi.fn(),
}));

const mockUseUser = vi.fn();
vi.mock("@tbe/hooks/useUser", () => ({
  default: () => mockUseUser(),
}));

const mockGetAccessToken = vi.fn();
vi.mock("@tbe/auth", () => ({
  getAccessToken: () => mockGetAccessToken(),
}));

import { useContentFeedback } from "@tbe/hooks";
import { sendRequest } from "@tbe/utils";

const mockSendRequest = vi.mocked(sendRequest);

describe("useContentFeedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessToken.mockReturnValue("mock-access-token");
    mockUseUser.mockReturnValue({
      user: { id: "user-123" },
      isAuth: true,
      loading: false,
    });
  });

  it("fetches existing feedback on mount when enabled and authenticated", async () => {
    mockSendRequest.mockResolvedValueOnce({
      status: true,
      data: {
        hasReviewed: true,
        rating: 5,
        reviewText: "Great resource!",
        meta: { resourceSlug: "react-basics" },
      },
    });

    const { result } = renderHookWithQuery(() =>
      useContentFeedback({
        contentType: "RESOURCE_GUIDE",
        contentId: "react-basics",
        enabled: true,
      }),
    );

    // Wait for the fetch to resolve
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockSendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        headers: {
          Authorization: "Bearer mock-access-token",
        },
        url: expect.stringContaining(
          "/content-feedback?userId=user-123&contentType=RESOURCE_GUIDE&contentId=react-basics",
        ),
      }),
    );

    expect(result.current.hasReviewed).toBe(true);
    expect(result.current.existingRating).toBe(5);
    expect(result.current.existingReviewText).toBe("Great resource!");
  });

  it("submits new feedback via POST successfully", async () => {
    mockSendRequest.mockResolvedValueOnce({
      status: true,
      data: {
        id: "cf-1",
        rating: 4,
        reviewText: "Very helpful guide",
      },
    });

    const { result } = renderHookWithQuery(() =>
      useContentFeedback({
        contentType: "RESOURCE_GUIDE",
        contentId: "docker-guide",
        enabled: false,
      }),
    );

    let success = false;
    await act(async () => {
      success = await result.current.submitFeedback(4, "Very helpful guide", {
        resourceSlug: "docker-guide",
      });
    });

    expect(success).toBe(true);
    expect(mockSendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "/content-feedback",
        headers: {
          Authorization: "Bearer mock-access-token",
        },
        body: {
          userId: "user-123",
          contentType: "RESOURCE_GUIDE",
          contentId: "docker-guide",
          rating: 4,
          reviewText: "Very helpful guide",
          meta: { resourceSlug: "docker-guide" },
        },
      }),
    );

    expect(result.current.hasReviewed).toBe(true);
    expect(result.current.existingRating).toBe(4);
    expect(result.current.existingReviewText).toBe("Very helpful guide");
  });

  it("handles submit failure gracefully", async () => {
    mockSendRequest.mockResolvedValueOnce({
      status: false,
      error: "Internal server error",
    });

    const { result } = renderHookWithQuery(() =>
      useContentFeedback({
        contentType: "RESOURCE_GUIDE",
        contentId: "system-design",
        enabled: false,
      }),
    );

    let success = true;
    await act(async () => {
      success = await result.current.submitFeedback(5, "Top notch!");
    });

    expect(success).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.hasReviewed).toBe(false);
  });

  it("does not submit if user is unauthenticated", async () => {
    mockUseUser.mockReturnValue({
      user: null,
      isAuth: false,
      loading: false,
    });

    const { result } = renderHookWithQuery(() =>
      useContentFeedback({
        contentType: "RESOURCE_GUIDE",
        contentId: "system-design",
        enabled: false,
      }),
    );

    let success = true;
    await act(async () => {
      success = await result.current.submitFeedback(5, "Top notch!");
    });

    expect(success).toBe(false);
    expect(mockSendRequest).not.toHaveBeenCalled();
  });
});
