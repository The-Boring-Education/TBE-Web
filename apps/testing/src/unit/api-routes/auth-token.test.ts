import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockVerifyToken = vi.fn();
const mockSignAccessToken = vi.fn();
const mockSignRefreshToken = vi.fn();
const mockGetUserByIdFromDB = vi.fn();
const mockConnectDB = vi.fn();
const mockLoggerInfo = vi.fn();
const mockLoggerError = vi.fn();

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: {
    info: (...args: unknown[]) => mockLoggerInfo(...args),
    error: (...args: unknown[]) => mockLoggerError(...args),
  },
}));

vi.mock("../../../../api/src/lib/auth", () => ({
  verifyToken: (...args: unknown[]) => mockVerifyToken(...args),
  signAccessToken: (...args: unknown[]) => mockSignAccessToken(...args),
  signRefreshToken: (...args: unknown[]) => mockSignRefreshToken(...args),
}));

vi.mock("../../../../api/src/lib/database", () => ({
  getUserByIdFromDB: (...args: unknown[]) => mockGetUserByIdFromDB(...args),
}));

vi.mock("../../../../api/src/middleware/api", () => ({
  connectDB: (...args: unknown[]) => mockConnectDB(...args),
}));

import handler from "../../../../api/src/pages/api/v1/auth/token";

describe("Auth token exchange API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConnectDB.mockResolvedValue(undefined);
    mockSignAccessToken.mockReturnValue("access.jwt");
    mockSignRefreshToken.mockReturnValue("refresh.jwt");
  });

  it("returns 204 for OPTIONS", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "OPTIONS",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(204);
  });

  it("returns 405 for non-POST methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Method not allowed");
  });

  it("returns 400 when body.code is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Authorization code is required");
  });

  it("returns 400 when payload type is not auth_code", async () => {
    mockVerifyToken.mockReturnValue({ type: "other", sub: "x" });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { code: "signed-code" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Invalid authorization code");
  });

  it("returns 401 when verifyToken throws", async () => {
    mockVerifyToken.mockImplementation(() => {
      throw new Error("bad token");
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { code: "bad" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Invalid or expired authorization code");
    expect(mockLoggerError).toHaveBeenCalled();
  });

  it("returns 404 when user is not found", async () => {
    mockVerifyToken.mockReturnValue({ type: "auth_code", sub: "uid" });
    mockGetUserByIdFromDB.mockResolvedValue({ data: null, error: "missing" });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { code: "ok" },
    });

    await handler(req, res);

    expect(mockConnectDB).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("User not found");
  });

  it("returns 200 with tokens and user when code and user are valid", async () => {
    mockVerifyToken.mockReturnValue({ type: "auth_code", sub: "uid-1" });
    mockGetUserByIdFromDB.mockResolvedValue({
      data: {
        _id: { toString: () => "uid-1" },
        email: "a@b.com",
        name: "Ada",
        image: "https://img",
        isOnboarded: true,
        userName: "ada",
        occupation: "dev",
        purpose: ["learn"],
        contactNo: "1",
        prepYatra: { goal: "job" },
        dsaYatra: {},
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { code: "valid" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data.accessToken).toBe("access.jwt");
    expect(data.data.refreshToken).toBe("refresh.jwt");
    expect(data.data.user).toMatchObject({
      id: "uid-1",
      email: "a@b.com",
      name: "Ada",
      userName: "ada",
    });
    expect(mockSignAccessToken).toHaveBeenCalled();
    expect(mockSignRefreshToken).toHaveBeenCalledWith("uid-1");
    expect(mockLoggerInfo).toHaveBeenCalled();
  });
});
