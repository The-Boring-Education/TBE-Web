import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAddANotificationToDB = vi.fn();
const mockGetAllNotificationsFromDB = vi.fn();
const mockUpdateANotificationInDB = vi.fn();
const mockDeleteANotificationsFromDB = vi.fn();
const mockAdminMiddleware = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
  },
}));

vi.mock("../../../../api/src/lib/database", () => ({
  addANotificationToDB: (...args: unknown[]) =>
    mockAddANotificationToDB(...args),
  getAllNotificationsFromDB: (...args: unknown[]) =>
    mockGetAllNotificationsFromDB(...args),
  updateANotificationInDB: (...args: unknown[]) =>
    mockUpdateANotificationInDB(...args),
  deleteANotificationsFromDB: (...args: unknown[]) =>
    mockDeleteANotificationsFromDB(...args),
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

import handler from "../../../../api/src/pages/api/v1/notification/index";

describe("Notification API — /api/v1/notification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminMiddleware.mockResolvedValue(true);
  });

  describe("Admin auth gate", () => {
    it("rejects unauthenticated requests (all methods)", async () => {
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

      for (const method of ["GET", "POST", "PATCH", "DELETE"] as const) {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method,
        });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(401);
      }
    });
  });

  describe("GET — list all notifications", () => {
    it("returns 200 with notifications", async () => {
      mockGetAllNotificationsFromDB.mockResolvedValue({
        data: [{ _id: "1", title: "Welcome" }],
        error: null,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(true);
      expect(data.data).toHaveLength(1);
    });

    it("returns 404 when DB errors", async () => {
      mockGetAllNotificationsFromDB.mockResolvedValue({
        data: null,
        error: "fetch error",
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });

  describe("POST — create notification", () => {
    it("returns 200 on success", async () => {
      mockAddANotificationToDB.mockResolvedValue({
        data: { _id: "new-1", title: "New Feature" },
        error: null,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: { title: "New Feature", message: "Check it out", type: "info" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(true);
      expect(data.message).toContain("added");
    });

    it("returns 404 on DB error", async () => {
      mockAddANotificationToDB.mockResolvedValue({
        data: null,
        error: "insert failed",
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: { title: "Test" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });

  it("rejects unsupported methods with 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "OPTIONS",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });
});
