import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/utils", () => ({
  sendRequest: vi.fn(),
}));

import useUsername from "@tbe/hooks/useUsername";
import { sendRequest } from "@tbe/utils";

const mockSendRequest = vi.mocked(sendRequest);

describe("useUsername", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("clears the message when username is empty", () => {
    const { result } = renderHookWithQuery(() => useUsername(""));

    expect(result.current.message).toBe("");
    expect(mockSendRequest).not.toHaveBeenCalled();
  });

  it("debounces the availability check and reports availability", async () => {
    mockSendRequest.mockResolvedValue({
      status: true,
      data: true,
      message: "Username is available",
    });

    const { result } = renderHookWithQuery(() => useUsername("octocat"));

    expect(result.current.isChecking).toBe(true);
    expect(result.current.message).toBe("Checking availability...");

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockSendRequest).toHaveBeenCalled();

    // Flush the resolved promise's microtask queue under fake timers.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.isUsernameAvailable).toBe(true);
    expect(result.current.message).toBe("Username is available");
    expect(result.current.isChecking).toBe(false);
  });

  it("reports unavailability when the username is taken", async () => {
    mockSendRequest.mockResolvedValue({
      status: true,
      data: false,
      message: "Username is taken",
    });

    const { result } = renderHookWithQuery(() => useUsername("taken-name"));

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.isUsernameAvailable).toBe(false);
    expect(result.current.message).toBe("Username is taken");
  });
});
