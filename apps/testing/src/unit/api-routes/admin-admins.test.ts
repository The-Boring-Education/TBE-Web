import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/middleware/requestLogger", () => ({
  withApiHandler: (
    handler: (req: NextApiRequest, res: NextApiResponse) => unknown,
  ) => handler,
}));

vi.mock("@/middleware/api", async () => ({
  connectDB: vi.fn(),
  adminMiddleware: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/middleware/admin", () => ({
  withVerifiedAdminAuth: (
    handler: (req: NextApiRequest, res: NextApiResponse) => unknown,
  ) => handler,
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/utils", () => ({
  sendAPIResponse: (obj: Record<string, unknown>) => obj,
}));

const mockGetAllAdminUsersFromDB = vi.fn();
const mockCreateAdminUserFromDB = vi.fn();
const mockGetAdminUserByIdFromDB = vi.fn();
const mockUpdateAdminUserFromDB = vi.fn();
const mockDeleteAdminUserFromDB = vi.fn();
const mockInvalidateAdminCache = vi.fn();

vi.mock("@/lib/database", () => ({
  getAllAdminUsersFromDB: (...args: unknown[]) =>
    mockGetAllAdminUsersFromDB(...args),
  createAdminUserFromDB: (...args: unknown[]) =>
    mockCreateAdminUserFromDB(...args),
  getAdminUserByIdFromDB: (...args: unknown[]) =>
    mockGetAdminUserByIdFromDB(...args),
  updateAdminUserFromDB: (...args: unknown[]) =>
    mockUpdateAdminUserFromDB(...args),
  deleteAdminUserFromDB: (...args: unknown[]) =>
    mockDeleteAdminUserFromDB(...args),
}));

vi.mock("@/lib/services/admin-cache", () => ({
  invalidateAdminCache: (...args: unknown[]) =>
    mockInvalidateAdminCache(...args),
}));

import adminIdHandler from "../../../../api/src/pages/api/v1/admin/admins/[adminId]";
import indexHandler from "../../../../api/src/pages/api/v1/admin/admins/index";

const VALID_ADMIN = {
  _id: "507f191e810c19729de860ea",
  email: "admin@example.com",
  name: "Admin",
  isActive: true,
};

describe("Admin Admins Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /admin/admins returns admin list", async () => {
    mockGetAllAdminUsersFromDB.mockResolvedValue({ data: [VALID_ADMIN] });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });

    await indexHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().data).toEqual([VALID_ADMIN]);
  });

  it("POST /admin/admins creates admin", async () => {
    mockCreateAdminUserFromDB.mockResolvedValue({ data: VALID_ADMIN });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        email: "admin@example.com",
        name: "Admin",
      },
      adminUser: { email: "owner@example.com" },
    });

    await indexHandler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(mockCreateAdminUserFromDB).toHaveBeenCalled();
    expect(mockInvalidateAdminCache).toHaveBeenCalled();
  });

  it("PATCH /admin/admins/:id updates admin", async () => {
    mockUpdateAdminUserFromDB.mockResolvedValue({
      data: { ...VALID_ADMIN, notes: "Updated" },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      query: { adminId: VALID_ADMIN._id },
      body: { notes: "Updated" },
    });

    await adminIdHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockUpdateAdminUserFromDB).toHaveBeenCalledWith(VALID_ADMIN._id, {
      notes: "Updated",
    });
  });

  it("DELETE /admin/admins/:id removes admin", async () => {
    mockDeleteAdminUserFromDB.mockResolvedValue({ data: { deleted: true } });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "DELETE",
      query: { adminId: VALID_ADMIN._id },
    });

    await adminIdHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockDeleteAdminUserFromDB).toHaveBeenCalledWith(VALID_ADMIN._id);
    expect(mockInvalidateAdminCache).toHaveBeenCalled();
  });
});
