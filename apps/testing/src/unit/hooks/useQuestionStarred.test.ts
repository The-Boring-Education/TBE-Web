import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockMakeRequest = vi.fn();

vi.mock("@tbe/hooks/useApi", () => ({
  __esModule: true,
  default: () => ({
    makeRequest: mockMakeRequest,
    data: null,
    loading: false,
    error: null,
  }),
}));

import useQuestionStarred from "@tbe/hooks/useQuestionStarred";

describe("useQuestionStarred", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes isStarred from initialIsStarred", () => {
    const { result } = renderHook(() =>
      useQuestionStarred({
        userId: "u1",
        sheetId: "s1",
        questionId: "q1",
        initialIsStarred: true,
      }),
    );

    expect(result.current.isStarred).toBe(true);
  });

  it("does not call API when userId is missing on toggle", async () => {
    const { result } = renderHook(() =>
      useQuestionStarred({
        userId: "",
        sheetId: "s1",
        questionId: "q1",
        initialIsStarred: false,
      }),
    );

    await act(async () => {
      await result.current.toggleStar();
    });

    expect(mockMakeRequest).not.toHaveBeenCalled();
  });

  it("optimistically toggles and keeps state when API returns success", async () => {
    mockMakeRequest.mockResolvedValue({ status: true });

    const { result } = renderHook(() =>
      useQuestionStarred({
        userId: "u1",
        sheetId: "s1",
        questionId: "q1",
        initialIsStarred: false,
      }),
    );

    await act(async () => {
      await result.current.toggleStar();
    });

    expect(result.current.isStarred).toBe(true);
    expect(mockMakeRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        body: expect.objectContaining({
          userId: "u1",
          sheetId: "s1",
          questionId: "q1",
          isStarred: true,
        }),
      }),
    );
  });

  it("reverts optimistic update when API returns status false", async () => {
    mockMakeRequest.mockResolvedValue({ status: false });

    const { result } = renderHook(() =>
      useQuestionStarred({
        userId: "u1",
        sheetId: "s1",
        questionId: "q1",
        initialIsStarred: false,
      }),
    );

    await act(async () => {
      await result.current.toggleStar();
    });

    expect(result.current.isStarred).toBe(false);
  });

  it("calls onSuccess callback with new starred state when API succeeds", async () => {
    mockMakeRequest.mockResolvedValue({ status: true });
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useQuestionStarred({
        userId: "u1",
        sheetId: "s1",
        questionId: "q1",
        initialIsStarred: false,
        onSuccess,
      }),
    );

    await act(async () => {
      await result.current.toggleStar();
    });

    expect(result.current.isStarred).toBe(true);
    expect(onSuccess).toHaveBeenCalledWith(true);
  });

  it("handles result.success === true and calls onSuccess", async () => {
    mockMakeRequest.mockResolvedValue({ success: true });
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useQuestionStarred({
        userId: "u1",
        sheetId: "s1",
        questionId: "q1",
        initialIsStarred: true,
        onSuccess,
      }),
    );

    await act(async () => {
      await result.current.toggleStar();
    });

    expect(result.current.isStarred).toBe(false);
    expect(onSuccess).toHaveBeenCalledWith(false);
  });

  it("does not call onSuccess and reverts state when request throws an error", async () => {
    mockMakeRequest.mockRejectedValue(new Error("Network error"));
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useQuestionStarred({
        userId: "u1",
        sheetId: "s1",
        questionId: "q1",
        initialIsStarred: false,
        onSuccess,
      }),
    );

    await act(async () => {
      await result.current.toggleStar();
    });

    expect(result.current.isStarred).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
