import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  withAdminAuth,
  withAuth,
} from "../../../../../packages/auth/src/middleware/withAuth";

const AUTH_COOKIE = "tbe_access_token";

/** Build a minimal JWT-like token (payload only; no real signature). Middleware decodes payload only. */
function makeToken(payload: Record<string, unknown>, expFuture = true) {
  const payloadObj = {
    ...payload,
    ...(expFuture && { exp: Math.floor(Date.now() / 1000) + 3600 }),
  };
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64");
  const payloadB64 = Buffer.from(JSON.stringify(payloadObj)).toString("base64");
  const sig = Buffer.from("sig").toString("base64");
  return `${header}.${payloadB64}.${sig}`;
}

const mockHandler = vi.fn();

describe("withAuth Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHandler.mockResolvedValue(undefined);
  });

  describe("withAuth", () => {
    it("should return 401 when no session exists", async () => {
      const wrapped = withAuth(mockHandler);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await wrapped(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe("Authentication required");
      expect(data.status).toBe(false);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("should return 401 when session has no user", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });
      req.headers.authorization = "Bearer invalid.not-enough.parts";

      const wrapped = withAuth(mockHandler);
      await wrapped(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("should call handler and attach user when valid token in cookie", async () => {
      const token = makeToken({
        sub: "user_123",
        email: "test@example.com",
        name: "Test User",
      });
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });
      (req as any).cookies = { [AUTH_COOKIE]: token };

      const wrapped = withAuth(mockHandler);
      await wrapped(req, res);

      expect(mockHandler).toHaveBeenCalled();
      const calledReq = mockHandler.mock.calls[0][0];
      expect(calledReq.user).toEqual({
        id: "user_123",
        email: "test@example.com",
        name: "Test User",
        image: undefined,
        isOnboarded: undefined,
      });
    });

    it("should call handler when valid token in Authorization header", async () => {
      const token = makeToken({
        sub: "user_456",
        email: "bearer@example.com",
      });
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });
      req.headers.authorization = `Bearer ${token}`;

      const wrapped = withAuth(mockHandler);
      await wrapped(req, res);

      expect(mockHandler).toHaveBeenCalled();
      const calledReq = mockHandler.mock.calls[0][0];
      expect(calledReq.user.email).toBe("bearer@example.com");
      expect(calledReq.user.id).toBe("user_456");
    });

    it("should return 401 when token is expired", async () => {
      const token = makeToken(
        {
          sub: "user_123",
          email: "test@example.com",
          exp: Math.floor(Date.now() / 1000) - 60,
        },
        false,
      );
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });
      req.headers.authorization = `Bearer ${token}`;

      const wrapped = withAuth(mockHandler);
      await wrapped(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe("Token expired or invalid");
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe("withAdminAuth", () => {
    const adminEmails = ["admin@tbe.com", "superadmin@tbe.com"];

    it("should return 401 when no token", async () => {
      const wrapped = withAdminAuth(adminEmails)(mockHandler);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await wrapped(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("should return 403 for non-admin user", async () => {
      const token = makeToken({
        sub: "user_123",
        email: "regular@user.com",
      });
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });
      req.headers.authorization = `Bearer ${token}`;

      const wrapped = withAdminAuth(adminEmails)(mockHandler);
      await wrapped(req, res);

      expect(res._getStatusCode()).toBe(403);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe("Admin access required");
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("should return 403 when user email is undefined", async () => {
      const token = makeToken({
        sub: "user_123",
        email: undefined as any,
        name: "No Email User",
      });
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });
      req.headers.authorization = `Bearer ${token}`;

      const wrapped = withAdminAuth(adminEmails)(mockHandler);
      await wrapped(req, res);

      expect(res._getStatusCode()).toBe(403);
    });

    it("should call handler for admin user", async () => {
      const token = makeToken({
        sub: "admin_1",
        email: "admin@tbe.com",
        name: "Admin",
      });
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });
      req.headers.authorization = `Bearer ${token}`;

      const wrapped = withAdminAuth(adminEmails)(mockHandler);
      await wrapped(req, res);

      expect(mockHandler).toHaveBeenCalled();
      const calledReq = mockHandler.mock.calls[0][0];
      expect(calledReq.user.email).toBe("admin@tbe.com");
      expect(calledReq.user.name).toBe("Admin");
    });

    it("should recognize all emails in admin list", async () => {
      for (const email of adminEmails) {
        vi.clearAllMocks();
        mockHandler.mockResolvedValue(undefined);
        const token = makeToken({ sub: "u", email });
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: "GET",
        });
        req.headers.authorization = `Bearer ${token}`;

        const wrapped = withAdminAuth(adminEmails)(mockHandler);
        await wrapped(req, res);

        expect(mockHandler).toHaveBeenCalled();
      }
    });
  });
});
