import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockVerifyToken = vi.fn();
const mockSignAccessToken = vi.fn();
const mockGetUserByIdFromDB = vi.fn();
const mockConnectDB = vi.fn();

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/lib/auth", () => ({
  verifyToken: (...args: unknown[]) => mockVerifyToken(...args),
  signAccessToken: (...args: unknown[]) => mockSignAccessToken(...args),
}));

vi.mock("../../../../api/src/lib/database", () => ({
  getUserByIdFromDB: (...args: unknown[]) => mockGetUserByIdFromDB(...args),
}));

vi.mock("../../../../api/src/middleware/api", () => ({
  connectDB: (...args: unknown[]) => mockConnectDB(...args),
}));

import handler from "../../../../api/src/pages/api/v1/auth/refresh";

describe("Auth refresh API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConnectDB.mockResolvedValue(undefined);
    mockSignAccessToken.mockReturnValue("new.access.jwt");
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

  it("returns 400 when refreshToken is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Refresh token is required");
  });

  it("returns 400 when payload type is not refresh", async () => {
    mockVerifyToken.mockReturnValue({ type: "access", sub: "x" });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { refreshToken: "tok" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Invalid refresh token");
  });

  it("returns 401 when verifyToken throws", async () => {
    mockVerifyToken.mockImplementation(() => {
      throw new Error("expired");
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { refreshToken: "bad" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Invalid or expired refresh token");
  });

  it("returns 404 when user is not found", async () => {
    mockVerifyToken.mockReturnValue({ type: "refresh", sub: "uid" });
    mockGetUserByIdFromDB.mockResolvedValue({ data: null });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { refreshToken: "valid.refresh" },
    });

    await handler(req, res);

    expect(mockConnectDB).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("User not found");
  });

  it("returns 200 with new access token and user", async () => {
    mockVerifyToken.mockReturnValue({ type: "refresh", sub: "uid-1" });
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
        prepYatra: {},
        dsaYatra: {},
      },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { refreshToken: "valid.refresh" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data.accessToken).toBe("new.access.jwt");
    expect(data.data.user).toMatchObject({
      id: "uid-1",
      email: "a@b.com",
      name: "Ada",
    });
    expect(mockSignAccessToken).toHaveBeenCalled();
  });
});
