import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration test: Admin authentication middleware
 * Verifies JWT + RBAC behavior via adminMiddleware compatibility wrapper.
 */

vi.mock("@/lib/utils", () => ({
  sendAPIResponse: (obj: any) => obj,
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const mockVerifyToken = vi.fn();
vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: (...args: unknown[]) => mockVerifyToken(...args),
}));

const mockIsAdminEmail = vi.fn();
const mockWarmAdminEmailCache = vi.fn();
vi.mock("@/lib/services/admin-cache", () => ({
  isAdminEmail: (...args: unknown[]) => mockIsAdminEmail(...args),
  warmAdminEmailCache: (...args: unknown[]) => mockWarmAdminEmailCache(...args),
}));

import { adminMiddleware } from "@/middleware/api";

describe("Admin Middleware Integration", () => {
  const adminToken = "valid-admin-jwt";
  const userToken = "valid-user-jwt";

  beforeEach(() => {
    vi.clearAllMocks();
    mockWarmAdminEmailCache.mockResolvedValue(undefined);
    mockIsAdminEmail.mockResolvedValue(false);
  });

  it("returns true for valid admin JWT", async () => {
    mockVerifyToken.mockReturnValue({
      sub: "admin-id",
      email: "admin@example.com",
      name: "Admin",
      type: "access",
    });
    mockIsAdminEmail.mockResolvedValue(true);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { authorization: "Bearer " + adminToken },
    });

    const result = await adminMiddleware(req, res);
    expect(result).toBe(true);
  });

  it("returns false and 403 for authenticated non-admin JWT", async () => {
    mockVerifyToken.mockReturnValue({
      sub: "user-id",
      email: "user@example.com",
      name: "User",
      type: "access",
    });
    mockIsAdminEmail.mockResolvedValue(false);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { authorization: "Bearer " + userToken },
    });

    const result = await adminMiddleware(req, res);
    expect(result).toBe(false);
    expect(res._getStatusCode()).toBe(403);
  });

  it("returns false and 401 when JWT is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: {},
    });

    const result = await adminMiddleware(req, res);
    expect(result).toBe(false);
    expect(res._getStatusCode()).toBe(401);
  });
});
