import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetPlaylistByTagFromDB = vi.fn();
const mockDeletePlaylistByTagFromDB = vi.fn();
const mockAdminMiddleware = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

vi.mock("../../../../api/src/lib/database", () => ({
  getPlaylistByTagFromDB: (...args: unknown[]) =>
    mockGetPlaylistByTagFromDB(...args),
  deletePlaylistByTagFromDB: (...args: unknown[]) =>
    mockDeletePlaylistByTagFromDB(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/middleware/api", () => ({
  adminMiddleware: (...args: unknown[]) => mockAdminMiddleware(...args),
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>,
  ) => handler,
}));

import handler from "../../../../api/src/pages/api/v1/youfocus/explore";

describe("YouFocus Explore API — /api/v1/youfocus/explore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminMiddleware.mockResolvedValue(true);
  });

  describe("GET — fetch playlists by skill", () => {
    it("returns 400 when query param 'q' is missing", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.message).toContain("'q' is required");
    });

    it("returns 200 with playlists on success", async () => {
      mockGetPlaylistByTagFromDB.mockResolvedValue({
        data: [{ _id: "1", tag: "react", videos: [] }],
        error: null,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { q: "react" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(true);
      expect(mockGetPlaylistByTagFromDB).toHaveBeenCalledWith("react");
    });

    it("returns 500 when DB query errors", async () => {
      mockGetPlaylistByTagFromDB.mockResolvedValue({
        data: null,
        error: "DB connection failed",
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { q: "nodejs" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });

    it("does NOT require admin auth for GET", async () => {
      mockGetPlaylistByTagFromDB.mockResolvedValue({ data: [], error: null });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { q: "python" },
      });

      await handler(req, res);

      expect(mockAdminMiddleware).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
    });
  });

  describe("DELETE — admin-only delete playlists by skill", () => {
    it("returns 401 when admin auth fails", async () => {
      mockAdminMiddleware.mockImplementation(
        async (_req: NextApiRequest, res: NextApiResponse) => {
          res.statusCode = 401;
          (res as any).json({
            status: false,
            message: "Unauthorized. Admin access required.",
          });
          return false;
        },
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { q: "react" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(mockDeletePlaylistByTagFromDB).not.toHaveBeenCalled();
    });

    it("returns 400 when 'q' param missing (after auth)", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: {},
      });

      await handler(req, res);

      expect(mockAdminMiddleware).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
    });

    it("returns 200 and deletes on valid admin request", async () => {
      mockDeletePlaylistByTagFromDB.mockResolvedValue({
        data: { deletedCount: 3 },
        error: null,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { q: "react" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(true);
      expect(mockDeletePlaylistByTagFromDB).toHaveBeenCalledWith("react");
    });

    it("returns 500 when DB delete errors", async () => {
      mockDeletePlaylistByTagFromDB.mockResolvedValue({
        data: null,
        error: "Delete failed",
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { q: "react" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });
  });

  it("rejects unsupported methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PUT",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });
});
