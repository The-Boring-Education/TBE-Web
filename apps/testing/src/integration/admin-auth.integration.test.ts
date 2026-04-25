import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration test: Admin authentication middleware
 * Tests the full admin auth flow including the timing-safe comparison fix.
 */

vi.mock("@/lib/utils", () => ({
  sendAPIResponse: (obj: any) => obj,
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { adminMiddleware } from "@/middleware/api";

describe("Admin Middleware Integration", () => {
  const REAL_SECRET = "admin-secret-test"; // matches setup.ts env

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_SECRET = REAL_SECRET;
  });

  it("returns true for valid admin secret", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { "x-admin-secret": REAL_SECRET },
    });

    const result = await adminMiddleware(req, res);

    expect(result).toBe(true);
    // No error response sent
    expect(res._getStatusCode()).toBe(200);
  });

  it("returns false and 401 for invalid admin secret", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { "x-admin-secret": "wrong-secret" },
    });

    const result = await adminMiddleware(req, res);

    expect(result).toBe(false);
    expect(res._getStatusCode()).toBe(401);
  });

  it("returns false and 401 when x-admin-secret header is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: {},
    });

    const result = await adminMiddleware(req, res);

    expect(result).toBe(false);
    expect(res._getStatusCode()).toBe(401);
  });

  it("returns false and 500 when ADMIN_SECRET env var is not set", async () => {
    delete process.env.ADMIN_SECRET;

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { "x-admin-secret": "any-value" },
    });

    const result = await adminMiddleware(req, res);

    expect(result).toBe(false);
    expect(res._getStatusCode()).toBe(500);
    const body = JSON.parse(res._getData());
    expect(body.message).toContain("configuration error");

    // Restore for other tests
    process.env.ADMIN_SECRET = REAL_SECRET;
  });

  it("rejects secrets with different lengths (timing-safe)", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { "x-admin-secret": "short" },
    });

    const result = await adminMiddleware(req, res);

    expect(result).toBe(false);
    expect(res._getStatusCode()).toBe(401);
  });

  it("rejects empty string secret", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { "x-admin-secret": "" },
    });

    const result = await adminMiddleware(req, res);

    expect(result).toBe(false);
    expect(res._getStatusCode()).toBe(401);
  });

  it("is case-sensitive", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { "x-admin-secret": REAL_SECRET.toUpperCase() },
    });

    const result = await adminMiddleware(req, res);

    // Only if the real secret is not already uppercase, this should fail
    if (REAL_SECRET !== REAL_SECRET.toUpperCase()) {
      expect(result).toBe(false);
    }
  });
});
