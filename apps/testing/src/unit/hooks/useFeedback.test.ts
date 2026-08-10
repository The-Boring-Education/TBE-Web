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

import useFeedback from "@tbe/hooks/useFeedback";
import { sendRequest } from "@tbe/utils";

const mockSendRequest = vi.mocked(sendRequest);

describe("useFeedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ user: { id: "user-1" } });
  });

  it("initializes with the rating step shown", () => {
    const { result } = renderHookWithQuery(() =>
      useFeedback({ type: "quiz", refId: "quiz-1" } as any),
    );

    expect(result.current.rating).toBe(0);
    expect(result.current.feedbackModal).toEqual({
      rating: true,
      feedback: false,
      success: false,
    });
  });

  it("submits a rating and advances to the success step", async () => {
    mockSendRequest.mockResolvedValue({ data: { feedbackId: "fb-1" } });

    const { result } = renderHookWithQuery(() =>
      useFeedback({ type: "quiz", refId: "quiz-1" } as any),
    );

    await act(async () => {
      await result.current.handleStarClick(5);
    });

    expect(mockSendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        body: expect.objectContaining({
          rating: 5,
          type: "quiz",
          ref: "quiz-1",
          userId: "user-1",
        }),
      }),
    );
    expect(result.current.rating).toBe(5);
    expect(result.current.feedbackModal.success).toBe(true);
  });

  it("does not advance to success when rating submission has no feedbackId", async () => {
    mockSendRequest.mockResolvedValue({ data: {} });

    const { result } = renderHookWithQuery(() =>
      useFeedback({ type: "quiz", refId: "quiz-1" } as any),
    );

    await act(async () => {
      await result.current.handleStarClick(3);
    });

    expect(result.current.feedbackModal.success).toBe(false);
  });

  it("submits detailed feedback and shows a success toast", async () => {
    mockSendRequest
      .mockResolvedValueOnce({ data: { feedbackId: "fb-1" } })
      .mockResolvedValueOnce({ data: { updated: true } });

    const { result } = renderHookWithQuery(() =>
      useFeedback({ type: "quiz", refId: "quiz-1" } as any),
    );

    await act(async () => {
      await result.current.handleStarClick(4);
    });

    act(() => {
      result.current.setFeedbackText("Loved the questions!");
    });

    await act(async () => {
      await result.current.handleFeedbackSubmit();
    });

    expect(mockSendRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "PUT",
        body: expect.objectContaining({
          feedbackId: "fb-1",
          feedback: "Loved the questions!",
          userId: "user-1",
        }),
      }),
    );
    expect(result.current.toast).toEqual({
      show: true,
      message: "Thanks for your feedback!",
    });
  });

  it("does not submit detailed feedback without a feedbackId", async () => {
    const { result } = renderHookWithQuery(() =>
      useFeedback({ type: "quiz", refId: "quiz-1" } as any),
    );

    act(() => {
      result.current.setFeedbackText("No rating yet");
    });

    await act(async () => {
      await result.current.handleFeedbackSubmit();
    });

    expect(mockSendRequest).not.toHaveBeenCalled();
  });
});
