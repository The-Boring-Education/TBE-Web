import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockVerifyToken = vi.fn();

vi.mock("../../../../api/src/lib/auth/jwt", () => ({
  verifyToken: (...args: unknown[]) => mockVerifyToken(...args),
}));

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import {
  getAuthenticatedUserId,
  verifyOwnership,
} from "../../../../api/src/middleware/userAuth";

describe("userAuth middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAuthenticatedUserId", () => {
    it("returns null and 401 when no Authorization header", () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      const result = getAuthenticatedUserId(req, res);

      expect(result).toBeNull();
      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe("Authentication required");
    });

    it("returns null and 401 when Authorization header has no Bearer prefix", () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        headers: { authorization: "Basic abc123" },
      });

      const result = getAuthenticatedUserId(req, res);

      expect(result).toBeNull();
      expect(res._getStatusCode()).toBe(401);
    });

    it("returns null and 401 when Bearer token is empty", () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        headers: { authorization: "Bearer " },
      });

      const result = getAuthenticatedUserId(req, res);

      expect(result).toBeNull();
      expect(res._getStatusCode()).toBe(401);
    });

    it("returns userId when token is valid access token", () => {
      mockVerifyToken.mockReturnValue({
        type: "access",
        sub: "user-123",
        email: "user@test.com",
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        headers: { authorization: "Bearer valid-token" },
      });

      const result = getAuthenticatedUserId(req, res);

      expect(result).toBe("user-123");
      expect(mockVerifyToken).toHaveBeenCalledWith("valid-token");
    });

    it("returns null and 401 when token type is not 'access'", () => {
      mockVerifyToken.mockReturnValue({
        type: "refresh",
        sub: "user-123",
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        headers: { authorization: "Bearer refresh-token" },
      });

      const result = getAuthenticatedUserId(req, res);

      expect(result).toBeNull();
      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe("Invalid token type");
    });

    it("returns null and 401 when token verification throws (expired)", () => {
      mockVerifyToken.mockImplementation(() => {
        throw new Error("jwt expired");
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        headers: { authorization: "Bearer expired-token" },
      });

      const result = getAuthenticatedUserId(req, res);

      expect(result).toBeNull();
      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe("Invalid or expired token");
    });

    it("returns null and 401 when token verification throws (tampered)", () => {
      mockVerifyToken.mockImplementation(() => {
        throw new Error("invalid signature");
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        headers: { authorization: "Bearer tampered-token" },
      });

      const result = getAuthenticatedUserId(req, res);

      expect(result).toBeNull();
      expect(res._getStatusCode()).toBe(401);
    });

    it("handles array authorization header", () => {
      mockVerifyToken.mockReturnValue({
        type: "access",
        sub: "user-456",
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        headers: { authorization: ["Bearer array-token"] },
      });

      const result = getAuthenticatedUserId(req, res);

      expect(result).toBe("user-456");
    });
  });

  describe("verifyOwnership", () => {
    it("returns true when requestedUserId matches authenticatedUserId", () => {
      const { res } = createMocks<NextApiRequest, NextApiResponse>();

      const result = verifyOwnership("user-123", "user-123", res);

      expect(result).toBe(true);
    });

    it("returns true when requestedUserId is undefined (use token identity)", () => {
      const { res } = createMocks<NextApiRequest, NextApiResponse>();

      const result = verifyOwnership("user-123", undefined, res);

      expect(result).toBe(true);
    });

    it("returns false and 403 when requestedUserId differs from authenticated", () => {
      const { res } = createMocks<NextApiRequest, NextApiResponse>();

      const result = verifyOwnership("user-123", "user-456", res);

      expect(result).toBe(false);
      expect(res._getStatusCode()).toBe(403);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe("Cannot access another user's data");
    });

    it("returns true when requestedUserId is empty string (treated as falsy)", () => {
      const { res } = createMocks<NextApiRequest, NextApiResponse>();

      const result = verifyOwnership("user-123", "", res);

      expect(result).toBe(true);
    });
  });
});
