import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/utils", () => ({
  sendRequest: vi.fn(),
}));

import useNotifications from "@tbe/hooks/useNotifications";
import { sendRequest } from "@tbe/utils";

const mockSendRequest = vi.mocked(sendRequest);

describe("useNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts in a loading state and fetches notifications when enabled", async () => {
    const notifications = [{ id: "n1", message: "Welcome!", read: false }];
    mockSendRequest.mockResolvedValue({ data: notifications });

    const { result } = renderHookWithQuery(() => useNotifications());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notifications).toEqual(notifications);
  });

  it("does not fetch and clears notifications when disabled", () => {
    const { result } = renderHookWithQuery(() =>
      useNotifications({ enabled: false }),
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.notifications).toEqual([]);
    expect(mockSendRequest).not.toHaveBeenCalled();
  });

  it("stops loading and keeps notifications empty when the request fails", async () => {
    mockSendRequest.mockRejectedValue(new Error("Network error"));

    const { result } = renderHookWithQuery(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notifications).toEqual([]);
  });
});
