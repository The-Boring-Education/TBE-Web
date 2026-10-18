import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthenticatedUserId = vi.fn();
const mockGetContributionsByUserIdFromDB = vi.fn();
const mockGetUserByIdFromDB = vi.fn();
const mockGetOrCreateContributorInDB = vi.fn();
const mockCreateContributionInDB = vi.fn();

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
  getContributionsByUserIdFromDB: (...args: unknown[]) =>
    mockGetContributionsByUserIdFromDB(...args),
  getUserByIdFromDB: (...args: unknown[]) => mockGetUserByIdFromDB(...args),
  getOrCreateContributorInDB: (...args: unknown[]) =>
    mockGetOrCreateContributorInDB(...args),
  createContributionInDB: (...args: unknown[]) =>
    mockCreateContributionInDB(...args),
}));

import handler from "../../../../api/src/pages/api/v1/contributor/submissions/index";

describe("/api/v1/contributor/submissions handler", () => {
  const validUserId = "507f1f77bcf86cd799439011";

  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(mockGetContributionsByUserIdFromDB).not.toHaveBeenCalled();
  });

  it("returns 405 Method Not Allowed for unsupported methods (e.g. PUT/DELETE)", async () => {
    mockGetAuthenticatedUserId.mockReturnValue(validUserId);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "DELETE",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getJSONData()).toEqual({
      status: false,
      message: "Method DELETE Not Allowed",
    });
  });

  describe("GET submissions", () => {
    it("forwards query parameters (category, status, pagination) to database query", async () => {
      mockGetAuthenticatedUserId.mockReturnValue(validUserId);
      const mockResult = { items: [], total: 0, currentPage: 1, totalPages: 0 };
      mockGetContributionsByUserIdFromDB.mockResolvedValueOnce({
        data: mockResult,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {
          status: "pending",
          category: "PR_BUG_FIX",
          typeGroup: "code",
          page: "2",
          limit: "15",
        },
      });

      await handler(req, res);

      expect(mockGetContributionsByUserIdFromDB).toHaveBeenCalledWith(
        validUserId,
        {
          status: "pending",
          category: "PR_BUG_FIX",
          typeGroup: "code",
          page: 2,
          limit: 15,
        },
      );
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ status: true, data: mockResult });
    });

    it("returns 500 when fetching submissions suffers a database error", async () => {
      mockGetAuthenticatedUserId.mockReturnValue(validUserId);
      mockGetContributionsByUserIdFromDB.mockResolvedValueOnce({
        error: "Database error",
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({
        status: false,
        message: "Failed to fetch submissions",
        error: "Database error",
      });
    });
  });

  describe("POST submission", () => {
    it("returns 400 for invalid or missing category", async () => {
      mockGetAuthenticatedUserId.mockReturnValue(validUserId);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          category: "INVALID_CAT",
          title: "Fix bug",
          proofUrl: "https://github.com",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData().message).toContain("Invalid category");
    });

    it("returns 400 when title or proofUrl are not valid strings (e.g. number/boolean)", async () => {
      mockGetAuthenticatedUserId.mockReturnValue(validUserId);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          category: "PR_BUG_FIX",
          title: 12345, // Not a string
          proofUrl: "https://github.com",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        status: false,
        message: "Valid title and proof URL strings are required",
      });
    });

    it("returns 500 when user lookup suffers a database failure", async () => {
      mockGetAuthenticatedUserId.mockReturnValue(validUserId);
      mockGetUserByIdFromDB.mockResolvedValueOnce({ error: "DB down" });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          category: "PR_BUG_FIX",
          title: "Fix crash",
          proofUrl: "https://github.com/pr/1",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({
        status: false,
        message: "Database error while fetching user",
        error: "DB down",
      });
    });

    it("returns 404 when user is not found", async () => {
      mockGetAuthenticatedUserId.mockReturnValue(validUserId);
      mockGetUserByIdFromDB.mockResolvedValueOnce({ data: null });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          category: "PR_BUG_FIX",
          title: "Fix crash",
          proofUrl: "https://github.com/pr/1",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        status: false,
        message: "User not found",
      });
    });

    it("returns 500 when contributor initialization fails", async () => {
      mockGetAuthenticatedUserId.mockReturnValue(validUserId);
      mockGetUserByIdFromDB.mockResolvedValueOnce({
        data: { _id: validUserId, email: "user@example.com" },
      });
      mockGetOrCreateContributorInDB.mockResolvedValueOnce({
        error: "Init failed",
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          category: "PR_BUG_FIX",
          title: "Fix crash",
          proofUrl: "https://github.com/pr/1",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({
        status: false,
        message: "Failed to initialize contributor profile",
        error: "Init failed",
      });
    });

    it("returns 500 when contribution persistence fails", async () => {
      mockGetAuthenticatedUserId.mockReturnValue(validUserId);
      mockGetUserByIdFromDB.mockResolvedValueOnce({
        data: { _id: validUserId, email: "user@example.com" },
      });
      mockGetOrCreateContributorInDB.mockResolvedValueOnce({
        data: { _id: "c-1", email: "user@example.com", name: "User" },
      });
      mockCreateContributionInDB.mockResolvedValueOnce({
        error: "Persistence transaction aborted",
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          category: "PR_BUG_FIX",
          title: "Fix crash",
          proofUrl: "https://github.com/pr/1",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({
        status: false,
        message: "Submission failed",
        error: "Persistence transaction aborted",
      });
    });

    it("returns 201 on valid submission creation", async () => {
      mockGetAuthenticatedUserId.mockReturnValue(validUserId);
      mockGetUserByIdFromDB.mockResolvedValueOnce({
        data: { _id: validUserId, email: "user@example.com", name: "User" },
      });
      mockGetOrCreateContributorInDB.mockResolvedValueOnce({
        data: { _id: "c-1", email: "user@example.com", name: "User" },
      });
      const createdDoc = { _id: "contrib-1", title: "Fix crash", status: "pending" };
      mockCreateContributionInDB.mockResolvedValueOnce({
        data: createdDoc,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          category: "PR_BUG_FIX",
          title: "  Fix crash  ",
          proofUrl: "  https://github.com/pr/1  ",
          description: "  Detailed fix  ",
        },
      });

      await handler(req, res);

      expect(mockCreateContributionInDB).toHaveBeenCalledWith({
        contributorId: "c-1",
        userId: validUserId,
        contributorName: "User",
        contributorEmail: "user@example.com",
        category: "PR_BUG_FIX",
        title: "Fix crash",
        proofUrl: "https://github.com/pr/1",
        description: "Detailed fix",
      });
      expect(res._getStatusCode()).toBe(201);
      expect(res._getJSONData()).toEqual({
        status: true,
        message: "Contribution submitted successfully",
        data: createdDoc,
      });
    });
  });
});
