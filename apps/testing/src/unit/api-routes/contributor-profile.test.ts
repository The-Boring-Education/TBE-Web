import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthenticatedUserId = vi.fn();
const mockGetUserByIdFromDB = vi.fn();
const mockGetOrCreateContributorInDB = vi.fn();
const mockGetContributorRankFromDB = vi.fn();

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (fn: unknown) => fn,
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/middleware/userAuth", () => ({
  getAuthenticatedUserId: (req: NextApiRequest, res: NextApiResponse) =>
    mockGetAuthenticatedUserId(req, res),
}));

vi.mock("../../../../api/src/lib/database", () => ({
  getUserByIdFromDB: (...args: unknown[]) => mockGetUserByIdFromDB(...args),
  getOrCreateContributorInDB: (...args: unknown[]) =>
    mockGetOrCreateContributorInDB(...args),
  getContributorRankFromDB: (...args: unknown[]) =>
    mockGetContributorRankFromDB(...args),
}));

import handler from "../../../../api/src/pages/api/v1/contributor/profile";

describe("/api/v1/contributor/profile handler", () => {
  const validUserId = "507f1f77bcf86cd799439011";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-GET HTTP methods with 405 Method Not Allowed", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getJSONData()).toEqual({
      status: false,
      message: "Method POST Not Allowed",
    });
  });

  it("halts execution when unauthenticated", async () => {
    mockGetAuthenticatedUserId.mockImplementation(
      (_req: NextApiRequest, res: NextApiResponse) => {
        res.status(401).json({ status: false, message: "Unauthorized" });
        return null;
      },
    );

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockGetUserByIdFromDB).not.toHaveBeenCalled();
  });

  it("returns 500 when user lookup suffers a database failure", async () => {
    mockGetAuthenticatedUserId.mockReturnValue(validUserId);
    mockGetUserByIdFromDB.mockResolvedValueOnce({
      error: "DB connection timeout",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({
      status: false,
      message: "Database error while fetching user",
      error: "DB connection timeout",
    });
  });

  it("returns 404 when user is not found in database", async () => {
    mockGetAuthenticatedUserId.mockReturnValue(validUserId);
    mockGetUserByIdFromDB.mockResolvedValueOnce({ data: null });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData()).toEqual({
      status: false,
      message: "User not found",
    });
  });

  it("returns 500 when getOrCreateContributorInDB fails", async () => {
    mockGetAuthenticatedUserId.mockReturnValue(validUserId);
    mockGetUserByIdFromDB.mockResolvedValueOnce({
      data: { _id: validUserId, email: "contributor@example.com" },
    });
    mockGetOrCreateContributorInDB.mockResolvedValueOnce({
      error: "Failed to create contributor doc",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({
      status: false,
      message: "Failed to load profile",
      error: "Failed to create contributor doc",
    });
  });

  it("returns complete profile shape including level, progressPercent, and rank on success", async () => {
    mockGetAuthenticatedUserId.mockReturnValue(validUserId);
    mockGetUserByIdFromDB.mockResolvedValueOnce({
      data: {
        _id: validUserId,
        email: "contributor@example.com",
        name: "Test Contributor",
        image: "https://example.com/pic.png",
      },
    });

    const mockContributor = {
      _id: "contributor-1",
      userId: validUserId,
      email: "contributor@example.com",
      name: "Test Contributor",
      avatar: "https://example.com/pic.png",
      role: "Contributor",
      totalXp: 35,
      approvedCount: 3,
      pendingCount: 1,
      isCaptain: false,
    };
    mockGetOrCreateContributorInDB.mockResolvedValueOnce({
      data: mockContributor,
    });
    mockGetContributorRankFromDB.mockResolvedValueOnce({ data: 4 });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      status: true,
      data: {
        ...mockContributor,
        level: 2, // Math.floor(35 / 20) + 1 = 2
        currentLevelXp: 15, // 35 % 20 = 15
        nextLevelXp: 20,
        progressPercent: 75, // round(15/20 * 100) = 75
        rank: 4,
      },
    });
  });
});
