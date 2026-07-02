import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/utils", () => ({
  sendAPIResponse: (obj: Record<string, unknown>) => obj,
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

import { ensureAdminAccess, verifyJwtAdmin } from "@/middleware/admin";
import { adminMiddleware } from "@/middleware/api";

vi.mock("@/middleware/api", () => ({
  adminMiddleware: vi.fn(),
}));

describe("Verified Admin Auth Integration", () => {
  const ADMIN_SECRET = "admin-secret-test";
  const adminToken = "valid-admin-jwt";
  const userToken = "valid-user-jwt";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_SECRET = ADMIN_SECRET;
    vi.mocked(adminMiddleware).mockResolvedValue(true);
    mockWarmAdminEmailCache.mockResolvedValue(undefined);
    mockIsAdminEmail.mockResolvedValue(false);
  });

  it("returns admin user for valid admin JWT", async () => {
    mockVerifyToken.mockReturnValue({
      sub: "admin-id",
      email: "admin@example.com",
      name: "Admin",
      type: "access",
    });
    mockIsAdminEmail.mockResolvedValue(true);

    const { req } = createMocks<NextApiRequest>({
      headers: { authorization: `Bearer ${adminToken}` },
    });

    const admin = await verifyJwtAdmin(req);
    expect(admin).toEqual({
      id: "admin-id",
      email: "admin@example.com",
      name: "Admin",
    });
  });

  it("returns null for non-admin JWT email", async () => {
    mockVerifyToken.mockReturnValue({
      sub: "user-id",
      email: "user@example.com",
      name: "User",
      type: "access",
    });
    mockIsAdminEmail.mockResolvedValue(false);

    const { req } = createMocks<NextApiRequest>({
      headers: { authorization: `Bearer ${userToken}` },
    });

    expect(await verifyJwtAdmin(req)).toBeNull();
  });

  it("ensureAdminAccess allows admin JWT", async () => {
    mockVerifyToken.mockReturnValue({
      sub: "admin-id",
      email: "admin@example.com",
      name: "Admin",
      type: "access",
    });
    mockIsAdminEmail.mockResolvedValue(true);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      headers: { authorization: `Bearer ${adminToken}` },
    });

    const result = await ensureAdminAccess(req, res);
    expect(result).toBe(true);
    expect(adminMiddleware).not.toHaveBeenCalled();
  });

  it("ensureAdminAccess returns 403 for authenticated non-admin JWT", async () => {
    mockVerifyToken.mockReturnValue({
      sub: "user-id",
      email: "user@example.com",
      name: "User",
      type: "access",
    });
    mockIsAdminEmail.mockResolvedValue(false);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      headers: { authorization: `Bearer ${userToken}` },
    });

    const result = await ensureAdminAccess(req, res);
    expect(result).toBe(false);
    expect(res._getStatusCode()).toBe(403);
    expect(adminMiddleware).not.toHaveBeenCalled();
  });

  it("ensureAdminAccess returns 401 for invalid JWT", async () => {
    mockVerifyToken.mockImplementation(() => {
      throw new Error("invalid token");
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      headers: { authorization: "Bearer bad-token" },
    });

    const result = await ensureAdminAccess(req, res);
    expect(result).toBe(false);
    expect(res._getStatusCode()).toBe(401);
  });

  it("ensureAdminAccess falls back to admin secret when no JWT", async () => {
    vi.mocked(adminMiddleware).mockResolvedValue(true);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      headers: { "x-admin-secret": ADMIN_SECRET },
    });

    const result = await ensureAdminAccess(req, res);
    expect(result).toBe(true);
    expect(adminMiddleware).toHaveBeenCalledWith(req, res);
  });
});
