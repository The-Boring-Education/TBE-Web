import jwt from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration tests for `/api/v1/auth/session` and `/api/v1/auth/refresh`.
 *
 * Token signing/verification runs for real; only the DB layer is stubbed so the
 * suite does not need a live Mongo instance.
 */

const mockGetUserByIdFromDB = vi.fn();

vi.mock("@/lib/database", () => ({
  getUserByIdFromDB: (...args: unknown[]) => mockGetUserByIdFromDB(...args),
}));

vi.mock("@/middleware/api", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

import refreshHandler from "../../../api/src/pages/api/v1/auth/refresh";
// Import handlers directly
import sessionHandler from "../../../api/src/pages/api/v1/auth/session";

const TEST_USER_ID = "user_test_123";

const getTestSecret = (): string =>
  process.env.AUTH_JWT_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "test-secret-at-least-32-chars-long-123";

/** Shape returned by `getUserByIdFromDB` — the handlers read from this, not from the token. */
const buildDBUser = (overrides: Record<string, unknown> = {}) => ({
  _id: { toString: () => TEST_USER_ID },
  email: "test@example.com",
  name: "Test User",
  image: "https://cdn.example.com/avatar.png",
  isOnboarded: false,
  userName: "testuser",
  ...overrides,
});

const createValidAccessToken = (payload: Record<string, unknown> = {}) => {
  return jwt.sign(
    {
      sub: TEST_USER_ID,
      email: "test@example.com",
      name: "Test User",
      type: "access",
      ...payload,
    },
    getTestSecret(),
    { expiresIn: "24h" },
  );
};

const createValidRefreshToken = (userId = TEST_USER_ID) => {
  return jwt.sign(
    {
      sub: userId,
      type: "refresh",
    },
    getTestSecret(),
    { expiresIn: "30d" },
  );
};

const createExpiredAccessToken = () => {
  return jwt.sign(
    {
      sub: "user_expired",
      email: "expired@example.com",
      name: "Expired User",
      type: "access",
    },
    getTestSecret(),
    { expiresIn: "-1h" }, // Already expired
  );
};

const createExpiredRefreshToken = () => {
  return jwt.sign(
    {
      sub: "user_expired",
      type: "refresh",
    },
    getTestSecret(),
    { expiresIn: "-1d" },
  );
};

describe("Auth Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserByIdFromDB.mockResolvedValue({ data: buildDBUser() });
  });

  describe("Session Endpoint", () => {
    it("should return user data for valid access token in Authorization header", async () => {
      const token = createValidAccessToken();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      await sessionHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(true);
      expect(mockGetUserByIdFromDB).toHaveBeenCalledWith(TEST_USER_ID);
      expect(data.data.id).toBe(TEST_USER_ID);
      expect(data.data.email).toBe("test@example.com");
    });

    it("should return 401 when the token is only present as a cookie", async () => {
      // The endpoint is Authorization-header only; cookies are not read.
      const token = createValidAccessToken();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        headers: {
          cookie: `tbe_access_token=${token}`,
        },
      });

      await sessionHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(false);
      expect(mockGetUserByIdFromDB).not.toHaveBeenCalled();
    });

    it("should return 401 for expired access token", async () => {
      const expiredToken = createExpiredAccessToken();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        headers: {
          authorization: `Bearer ${expiredToken}`,
        },
      });

      await sessionHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(false);
    });

    it("should return 401 for missing token", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await sessionHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(false);
      expect(data.message).toBe("No token provided");
    });

    it("should return 401 for malformed token", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        headers: {
          authorization: "Bearer malformed.token",
        },
      });

      await sessionHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });

    it("should return 404 when the token subject no longer exists", async () => {
      mockGetUserByIdFromDB.mockResolvedValue({ data: null });
      const token = createValidAccessToken();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      await sessionHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(false);
    });

    it("should report isOnboarded from the stored user, not the token", async () => {
      mockGetUserByIdFromDB.mockResolvedValue({
        data: buildDBUser({ isOnboarded: true }),
      });
      const token = createValidAccessToken({ isOnboarded: false });
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      await sessionHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data.isOnboarded).toBe(true);
    });

    it("should return 405 for non-GET methods", async () => {
      const token = createValidAccessToken();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      await sessionHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });

  describe("Refresh Endpoint", () => {
    it("should return new access token for valid refresh token", async () => {
      const refreshToken = createValidRefreshToken();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: { refreshToken },
      });

      await refreshHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data.accessToken).toBeDefined();
      expect(data.data.user.id).toBe(TEST_USER_ID);

      const minted = jwt.verify(
        data.data.accessToken,
        getTestSecret(),
      ) as Record<string, unknown>;
      expect(minted.type).toBe("access");
      expect(minted.sub).toBe(TEST_USER_ID);
    });

    it("should return 404 when the refresh token subject no longer exists", async () => {
      mockGetUserByIdFromDB.mockResolvedValue({ data: null });
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: { refreshToken: createValidRefreshToken() },
      });

      await refreshHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });

    it("should return 401 for expired refresh token", async () => {
      const expiredRefreshToken = createExpiredRefreshToken();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: { refreshToken: expiredRefreshToken },
      });

      await refreshHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(false);
    });

    it("should return 400 for missing refresh token", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {},
      });

      await refreshHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("should return 401 for invalid refresh token", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: { refreshToken: "invalid.refresh.token" },
      });

      await refreshHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });

    it("should return 405 for non-POST methods", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await refreshHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });

    it("should reject token signed with different secret", async () => {
      const wrongSecretToken = jwt.sign(
        { sub: "user_wrong", type: "refresh" },
        "completely-different-secret-key",
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: { refreshToken: wrongSecretToken },
      });

      await refreshHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });
  });

  describe("Token Type Validation", () => {
    it("should reject access token used as refresh token", async () => {
      const accessToken = createValidAccessToken();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: { refreshToken: accessToken },
      });

      await refreshHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(mockGetUserByIdFromDB).not.toHaveBeenCalled();
    });

    it("should serve session data from the DB for a refresh token", async () => {
      // The session endpoint does not enforce `type === "access"`; it trusts the
      // signature and resolves the user by `sub`, so claims on the token are unused.
      const refreshToken = createValidRefreshToken();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        headers: {
          authorization: `Bearer ${refreshToken}`,
        },
      });

      await sessionHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data.email).toBe("test@example.com");
    });
  });

  describe("Security Edge Cases", () => {
    it("should accept a token with future iat (jsonwebtoken does not check it)", async () => {
      const futureToken = jwt.sign(
        {
          sub: TEST_USER_ID,
          email: "future@example.com",
          name: "Future User",
          type: "access",
          iat: Math.floor(Date.now() / 1000) + 3600, // 1 hour in future
        },
        getTestSecret(),
        { expiresIn: "24h" },
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        headers: {
          authorization: `Bearer ${futureToken}`,
        },
      });

      await sessionHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });

    it("should return stored values verbatim, without sanitising them", async () => {
      mockGetUserByIdFromDB.mockResolvedValue({
        data: buildDBUser({
          name: "Test User <script>alert('xss')</script>",
          email: "test+special@example.com",
        }),
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        headers: {
          authorization: `Bearer ${createValidAccessToken()}`,
        },
      });

      await sessionHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      // Escaping is the responsibility of the consumer, not the API.
      expect(data.data.name).toContain("<script>");
      expect(data.data.email).toBe("test+special@example.com");
    });
  });
});
