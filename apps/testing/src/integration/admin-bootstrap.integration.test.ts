import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/middleware/requestLogger", () => ({
  withApiHandler: (
    handler: (req: NextApiRequest, res: NextApiResponse) => unknown,
  ) => handler,
}));

vi.mock("@/middleware/api", () => ({
  connectDB: vi.fn(),
  adminMiddleware: vi.fn(),
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/utils", () => ({
  sendAPIResponse: (obj: Record<string, unknown>) => obj,
}));

const mockCountAllAdminUsersFromDB = vi.fn();
const mockCreateAdminUserFromDB = vi.fn();
const mockInvalidateAdminCache = vi.fn();

vi.mock("@/lib/database", () => ({
  countAllAdminUsersFromDB: (...args: unknown[]) =>
    mockCountAllAdminUsersFromDB(...args),
  createAdminUserFromDB: (...args: unknown[]) =>
    mockCreateAdminUserFromDB(...args),
}));

vi.mock("@/lib/services/admin-cache", () => ({
  invalidateAdminCache: (...args: unknown[]) =>
    mockInvalidateAdminCache(...args),
}));

import { adminMiddleware } from "@/middleware/api";

import bootstrapHandler from "../../../api/src/pages/api/v1/admin/admins/bootstrap";

describe("Admin Bootstrap Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminMiddleware).mockResolvedValue(true);
  });

  it("creates first admin when collection is empty", async () => {
    mockCountAllAdminUsersFromDB.mockResolvedValue({ data: 0 });
    mockCreateAdminUserFromDB.mockResolvedValue({
      data: {
        _id: "507f191e810c19729de860ea",
        email: "admin@example.com",
        isActive: true,
      },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { "x-admin-secret": "secret" },
      body: {
        email: "admin@example.com",
        name: "Admin",
      },
    });

    await bootstrapHandler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(mockCreateAdminUserFromDB).toHaveBeenCalled();
    expect(mockInvalidateAdminCache).toHaveBeenCalled();
  });

  it("returns 409 when admins already exist", async () => {
    mockCountAllAdminUsersFromDB.mockResolvedValue({ data: 1 });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { "x-admin-secret": "secret" },
      body: { email: "another@example.com" },
    });

    await bootstrapHandler(req, res);

    expect(res._getStatusCode()).toBe(409);
    expect(mockCreateAdminUserFromDB).not.toHaveBeenCalled();
  });

  it("rejects bootstrap without admin secret", async () => {
    vi.mocked(adminMiddleware).mockImplementation(async (_req, res) => {
      res.status(401).json({ message: "Unauthorized" });
      return false;
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { email: "admin@example.com" },
    });

    await bootstrapHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockCreateAdminUserFromDB).not.toHaveBeenCalled();
  });
});
