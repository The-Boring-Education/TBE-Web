import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetServerSession = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: (...args: any[]) => mockGetServerSession(...args),
}));

import {
  withAdminAuth,
  withAuth,
} from "../../../../../packages/auth/src/middleware/withAuth";

const mockAuthOptions = {
  providers: [],
  secret: "test-secret",
} as any;

const mockHandler = vi.fn();

describe("withAuth Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHandler.mockResolvedValue(undefined);
  });

  describe("withAuth", () => {
    it("should return 401 when no session exists", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const protectedHandler = withAuth(mockAuthOptions)(mockHandler);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await protectedHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe("Authentication required");
      expect(data.success).toBe(false);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("should return 401 when session has no user", async () => {
      mockGetServerSession.mockResolvedValue({ user: null });

      const protectedHandler = withAuth(mockAuthOptions)(mockHandler);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await protectedHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("should call handler and attach session when authenticated", async () => {
      const session = {
        user: {
          id: "user_123",
          email: "test@example.com",
          name: "Test User",
        },
      };
      mockGetServerSession.mockResolvedValue(session);

      const protectedHandler = withAuth(mockAuthOptions)(mockHandler);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await protectedHandler(req, res);

      expect(mockHandler).toHaveBeenCalled();
      const calledReq = mockHandler.mock.calls[0][0];
      expect(calledReq.session).toEqual(session);
      expect(calledReq.user).toEqual(session.user);
    });

    it("should pass authOptions to getServerSession", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const protectedHandler = withAuth(mockAuthOptions)(mockHandler);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await protectedHandler(req, res);

      expect(mockGetServerSession).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        mockAuthOptions,
      );
    });

    it("should return 500 when getServerSession throws", async () => {
      mockGetServerSession.mockRejectedValue(new Error("Auth service down"));

      const protectedHandler = withAuth(mockAuthOptions)(mockHandler);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await protectedHandler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe("Authentication error");
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe("withAdminAuth", () => {
    const adminEmails = ["admin@tbe.com", "superadmin@tbe.com"];

    it("should return 401 when no session exists", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const protectedHandler = withAdminAuth(
        mockAuthOptions,
        adminEmails,
      )(mockHandler);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await protectedHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("should return 403 for non-admin user", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: "regular@user.com" },
      });

      const protectedHandler = withAdminAuth(
        mockAuthOptions,
        adminEmails,
      )(mockHandler);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await protectedHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe("Admin access required");
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("should return 403 when user email is undefined", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { name: "No Email User" },
      });

      const protectedHandler = withAdminAuth(
        mockAuthOptions,
        adminEmails,
      )(mockHandler);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await protectedHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
    });

    it("should call handler for admin user", async () => {
      const session = {
        user: { email: "admin@tbe.com", name: "Admin" },
      };
      mockGetServerSession.mockResolvedValue(session);

      const protectedHandler = withAdminAuth(
        mockAuthOptions,
        adminEmails,
      )(mockHandler);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await protectedHandler(req, res);

      expect(mockHandler).toHaveBeenCalled();
      const calledReq = mockHandler.mock.calls[0][0];
      expect(calledReq.session).toEqual(session);
      expect(calledReq.user).toEqual(session.user);
    });

    it("should recognize all emails in admin list", async () => {
      for (const email of adminEmails) {
        vi.clearAllMocks();
        mockHandler.mockResolvedValue(undefined);
        mockGetServerSession.mockResolvedValue({
          user: { email },
        });

        const protectedHandler = withAdminAuth(
          mockAuthOptions,
          adminEmails,
        )(mockHandler);
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: "GET",
        });

        await protectedHandler(req, res);
        expect(mockHandler).toHaveBeenCalled();
      }
    });

    it("should return 500 when auth throws", async () => {
      mockGetServerSession.mockRejectedValue(new Error("DB error"));

      const protectedHandler = withAdminAuth(
        mockAuthOptions,
        adminEmails,
      )(mockHandler);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await protectedHandler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });
  });
});
