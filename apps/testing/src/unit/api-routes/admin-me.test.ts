import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/middleware/requestLogger", () => ({
  withApiHandler: (
    handler: (req: NextApiRequest, res: NextApiResponse) => unknown,
  ) => handler,
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/utils", () => ({
  sendAPIResponse: (obj: Record<string, unknown>) => obj,
}));

const mockVerifyAuthenticatedUser = vi.fn();
const mockIsAdminEmail = vi.fn();
const mockGetAdminUserByEmailFromDB = vi.fn();

vi.mock("@/middleware/admin", () => ({
  verifyAuthenticatedUser: (...args: unknown[]) =>
    mockVerifyAuthenticatedUser(...args),
}));

vi.mock("@/lib/services/admin-cache", () => ({
  isAdminEmail: (...args: unknown[]) => mockIsAdminEmail(...args),
}));

vi.mock("@/lib/database", () => ({
  getAdminUserByEmailFromDB: (...args: unknown[]) =>
    mockGetAdminUserByEmailFromDB(...args),
}));

import meHandler from "../../../../api/src/pages/api/v1/admin/me";

describe("GET /admin/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without authentication", async () => {
    mockVerifyAuthenticatedUser.mockReturnValue(null);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });

    await meHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  it("returns isAdmin false for non-admin user", async () => {
    mockVerifyAuthenticatedUser.mockReturnValue({
      sub: "user-id",
      email: "user@example.com",
      type: "access",
    });
    mockIsAdminEmail.mockResolvedValue(false);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { authorization: "Bearer token" },
    });

    await meHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().data).toEqual({ isAdmin: false });
  });

  it("returns admin profile for admin user", async () => {
    const adminProfile = {
      _id: "507f191e810c19729de860ea",
      email: "admin@example.com",
      isActive: true,
    };

    mockVerifyAuthenticatedUser.mockReturnValue({
      sub: "admin-id",
      email: "admin@example.com",
      type: "access",
    });
    mockIsAdminEmail.mockResolvedValue(true);
    mockGetAdminUserByEmailFromDB.mockResolvedValue({ data: adminProfile });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { authorization: "Bearer token" },
    });

    await meHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().data).toEqual({
      isAdmin: true,
      admin: adminProfile,
    });
  });
});
