import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/utils", () => ({
  sendRequest: vi.fn(),
}));

import useSkillPlaylist from "@tbe/hooks/useSkillPlaylist";
import { sendRequest } from "@tbe/utils";

const mockSendRequest = vi.mocked(sendRequest);

describe("useSkillPlaylist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not fetch when the query is empty", () => {
    const { result } = renderHookWithQuery(() => useSkillPlaylist(""));

    expect(mockSendRequest).not.toHaveBeenCalled();
    expect(result.current.playlists).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("returns playlists for a successful query", async () => {
    const playlists = [{ id: "p1", title: "React Basics" }];
    mockSendRequest.mockResolvedValue({ data: playlists });

    const { result } = renderHookWithQuery(() => useSkillPlaylist("react"));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.playlists).toEqual(playlists);
    expect(result.current.errorMessage).toBeNull();
    expect(mockSendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: expect.stringContaining("react"),
      }),
    );
  });

  it("surfaces a friendly message when no playlists are found", async () => {
    mockSendRequest.mockResolvedValue({ data: [] });

    const { result } = renderHookWithQuery(() => useSkillPlaylist("obscure"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.errorMessage).toBe(
      "No playlists found for this skill.",
    );
  });

  it("surfaces the query error message on failure", async () => {
    mockSendRequest.mockRejectedValue(new Error("Network down"));

    const { result } = renderHookWithQuery(() => useSkillPlaylist("react"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.errorMessage).toBe("Network down");
  });
});
