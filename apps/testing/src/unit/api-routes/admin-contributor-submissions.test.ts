import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockEnsureAdminAccess = vi.fn();
const mockGetContributionsForAdminFromDB = vi.fn();

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (fn: unknown) => fn,
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/middleware/admin", () => ({
  ensureAdminAccess: (req: NextApiRequest, res: NextApiResponse) =>
    mockEnsureAdminAccess(req, res),
}));

vi.mock("../../../../api/src/lib/database", () => ({
  getContributionsForAdminFromDB: (...args: unknown[]) =>
    mockGetContributionsForAdminFromDB(...args),
}));

import handler from "../../../../api/src/pages/api/v1/admin/contributors/submissions/index";

describe("/api/v1/admin/contributors/submissions handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 405 Method Not Allowed for non-GET methods", async () => {
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

  it("halts execution when admin access is denied", async () => {
    mockEnsureAdminAccess.mockImplementation(
      (_req: NextApiRequest, res: NextApiResponse) => {
        res.status(403).json({ status: false, message: "Forbidden" });
        return false;
      },
    );

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(mockGetContributionsForAdminFromDB).not.toHaveBeenCalled();
  });

  it("forwards filter, search, and pagination parameters to DB query", async () => {
    mockEnsureAdminAccess.mockResolvedValue(true);
    const mockData = { items: [], total: 0, currentPage: 2, totalPages: 5 };
    mockGetContributionsForAdminFromDB.mockResolvedValueOnce({
      data: mockData,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {
        status: "pending",
        category: "PR_BUG_FIX",
        search: "nitin",
        page: "2",
        limit: "15",
      },
    });

    await handler(req, res);

    expect(mockGetContributionsForAdminFromDB).toHaveBeenCalledWith({
      status: "pending",
      category: "PR_BUG_FIX",
      search: "nitin",
      page: 2,
      limit: 15,
    });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({ status: true, data: mockData });
  });

  it("clamps invalid or missing pagination parameters to safe defaults", async () => {
    mockEnsureAdminAccess.mockResolvedValue(true);
    mockGetContributionsForAdminFromDB.mockResolvedValueOnce({
      data: { items: [], total: 0, currentPage: 1, totalPages: 1 },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {
        page: "-5",
        limit: "500",
      },
    });

    await handler(req, res);

    expect(mockGetContributionsForAdminFromDB).toHaveBeenCalledWith({
      status: undefined,
      category: undefined,
      search: undefined,
      page: 1,
      limit: 100,
    });
  });

  it("returns 500 when fetching moderation queue suffers a database failure", async () => {
    mockEnsureAdminAccess.mockResolvedValue(true);
    mockGetContributionsForAdminFromDB.mockResolvedValueOnce({
      error: "DB connection failed",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({
      status: false,
      message: "Failed to fetch moderation queue",
      error: "DB connection failed",
    });
  });
});
