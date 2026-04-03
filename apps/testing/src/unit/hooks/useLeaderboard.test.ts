import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/utils", () => ({
  sendRequest: vi.fn(),
}));

import useLeaderboard from "@tbe/hooks/useLeaderboard";
import { sendRequest } from "@tbe/utils";

const mockSendRequest = vi.mocked(sendRequest);

describe("useLeaderboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns loading and empty data while the request is pending", () => {
    mockSendRequest.mockReturnValue(new Promise(() => {}));

    const { result } = renderHookWithQuery(() => useLeaderboard("DAILY"));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it("maps response.data.entries to data", async () => {
    mockSendRequest.mockResolvedValue({
      data: {
        entries: [{ userId: "u1", points: 10 }],
      },
    });

    const { result } = renderHookWithQuery(() => useLeaderboard("WEEKLY"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([{ userId: "u1", points: 10 }]);
  });

  it("defaults to an empty array when entries are missing", async () => {
    mockSendRequest.mockResolvedValue({ data: {} });

    const { result } = renderHookWithQuery(() => useLeaderboard("MONTHLY"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });

  it("requests the leaderboard with the tab type in the query string", async () => {
    mockSendRequest.mockResolvedValue({
      data: { entries: [] },
    });

    renderHookWithQuery(() => useLeaderboard("DAILY"));

    await waitFor(() => {
      expect(mockSendRequest).toHaveBeenCalled();
    });

    expect(mockSendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: expect.stringMatching(/type=DAILY/),
      }),
    );
  });
});
