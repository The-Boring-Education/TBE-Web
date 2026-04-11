import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseUser = vi.fn();

vi.mock("@tbe/hooks/useUser", () => ({
  default: () => mockUseUser(),
}));

vi.mock("@tbe/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tbe/utils")>();
  return {
    ...actual,
    sendRequest: vi.fn(),
    getUserGamificationLevel: vi.fn(),
  };
});

import useGamification from "@tbe/hooks/useGamification";
import { getUserGamificationLevel, sendRequest } from "@tbe/utils";

const mockSendRequest = vi.mocked(sendRequest);
const mockGetUserGamificationLevel = vi.mocked(getUserGamificationLevel);

describe("useGamification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserGamificationLevel.mockReturnValue({
      currentLevel: 1,
      currentLevelName: "Starter",
      pointsLeftToNextLevel: 50,
      nextLevelName: "Pro",
      percentageProgress: 40,
    });
  });

  it("does not fetch when user id is missing", () => {
    mockUseUser.mockReturnValue({
      user: null,
      isAuth: false,
      loading: false,
      isOnboarded: false,
      updateSession: vi.fn(),
    });

    renderHookWithQuery(() => useGamification());

    expect(mockSendRequest).not.toHaveBeenCalled();
    expect(mockGetUserGamificationLevel).toHaveBeenCalledWith(0);
  });

  it("returns loading while the gamification request is pending", () => {
    mockUseUser.mockReturnValue({
      user: { id: "u1" },
      isAuth: true,
      loading: false,
      isOnboarded: true,
      updateSession: vi.fn(),
    });
    mockSendRequest.mockReturnValue(new Promise(() => {}));

    const { result } = renderHookWithQuery(() => useGamification());

    expect(result.current.loading).toBe(true);
  });

  it("maps points from the API and derives level fields from getUserGamificationLevel", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "u1" },
      isAuth: true,
      loading: false,
      isOnboarded: true,
      updateSession: vi.fn(),
    });
    mockSendRequest.mockResolvedValue({
      data: { points: 120 },
    });

    const { result } = renderHookWithQuery(() => useGamification());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetUserGamificationLevel).toHaveBeenCalledWith(120);
    expect(result.current.points).toBe(120);
    expect(result.current.currentLevel).toBe(1);
    expect(result.current.currentLevelName).toBe("Starter");
    expect(result.current.pointsLeftToNextLevel).toBe(50);
    expect(result.current.nextLevelName).toBe("Pro");
    expect(result.current.percentageProgress).toBe(40);
  });

  it("defaults points to 0 when the response omits data.points", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "u1" },
      isAuth: true,
      loading: false,
      isOnboarded: true,
      updateSession: vi.fn(),
    });
    mockSendRequest.mockResolvedValue({ data: {} });

    const { result } = renderHookWithQuery(() => useGamification());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetUserGamificationLevel).toHaveBeenCalledWith(0);
    expect(result.current.points).toBe(0);
  });

  it("calls gamification API with userId query param", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "user-42" },
      isAuth: true,
      loading: false,
      isOnboarded: true,
      updateSession: vi.fn(),
    });
    mockSendRequest.mockResolvedValue({ data: { points: 0 } });

    renderHookWithQuery(() => useGamification());

    await waitFor(() => {
      expect(mockSendRequest).toHaveBeenCalled();
    });

    expect(mockSendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: expect.stringMatching(/userId=user-42/),
      }),
    );
  });
});
