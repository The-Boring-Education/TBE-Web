import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

import {
  ensureAdminAccess,
  ensureAdminAccessOrSecret,
  verifyJwtAdmin,
} from "@/middleware/admin";

describe("Verified Admin Auth Integration", () => {
  const adminToken = "valid-admin-jwt";
  const userToken = "valid-user-jwt";

  beforeEach(() => {
    vi.clearAllMocks();
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
      headers: { authorization: "Bearer " + adminToken },
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
      headers: { authorization: "Bearer " + userToken },
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
      headers: { authorization: "Bearer " + adminToken },
    });

    const result = await ensureAdminAccess(req, res);
    expect(result).toBe(true);
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
      headers: { authorization: "Bearer " + userToken },
    });

    const result = await ensureAdminAccess(req, res);
    expect(result).toBe(false);
    expect(res._getStatusCode()).toBe(403);
  });

  it("ensureAdminAccess returns 401 for invalid JWT", async () => {
    mockVerifyToken.mockImplementation(() => {
      throw new Error("invalid token");
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      headers: { authorization: "******" },
    });

    const result = await ensureAdminAccess(req, res);
    expect(result).toBe(false);
    expect(res._getStatusCode()).toBe(401);
  });

  it("ensureAdminAccess returns 401 when JWT is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      headers: {},
    });

    const result = await ensureAdminAccess(req, res);
    expect(result).toBe(false);
    expect(res._getStatusCode()).toBe(401);
  });
});

describe("ensureAdminAccessOrSecret", () => {
  const adminSecret = "a-sufficiently-long-admin-secret";
  const previousAdminSecret = process.env.ADMIN_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_SECRET = adminSecret;
    mockWarmAdminEmailCache.mockResolvedValue(undefined);
    mockIsAdminEmail.mockResolvedValue(false);
  });

  afterEach(() => {
    if (previousAdminSecret === undefined) {
      delete process.env.ADMIN_SECRET;
    } else {
      process.env.ADMIN_SECRET = previousAdminSecret;
    }
  });

  it("allows a matching x-admin-secret without a JWT", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      headers: { "x-admin-secret": adminSecret },
    });

    const result = await ensureAdminAccessOrSecret(req, res);
    expect(result).toBe(true);
    expect(mockVerifyToken).not.toHaveBeenCalled();
  });

  it("falls back to admin JWT when the secret is missing", async () => {
    mockVerifyToken.mockReturnValue({
      sub: "admin-id",
      email: "admin@example.com",
      name: "Admin",
      type: "access",
    });
    mockIsAdminEmail.mockResolvedValue(true);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      headers: { authorization: "Bearer valid-admin-jwt" },
    });

    const result = await ensureAdminAccessOrSecret(req, res);
    expect(result).toBe(true);
  });

  it("returns 401 when both the secret and JWT are missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      headers: {},
    });

    const result = await ensureAdminAccessOrSecret(req, res);
    expect(result).toBe(false);
    expect(res._getStatusCode()).toBe(401);
  });

  it("returns 401 when the secret is wrong and no JWT is sent", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      headers: { "x-admin-secret": "wrong-secret-wrong-secret" },
    });

    const result = await ensureAdminAccessOrSecret(req, res);
    expect(result).toBe(false);
    expect(res._getStatusCode()).toBe(401);
  });
});
