import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockVerifyToken = vi.fn();
const mockGetUserByIdFromDB = vi.fn();
const mockConnectDB = vi.fn();

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/lib/auth", () => ({
  verifyToken: (...args: unknown[]) => mockVerifyToken(...args),
}));

vi.mock("../../../../api/src/lib/database", () => ({
  getUserByIdFromDB: (...args: unknown[]) => mockGetUserByIdFromDB(...args),
}));

vi.mock("../../../../api/src/middleware/api", () => ({
  connectDB: (...args: unknown[]) => mockConnectDB(...args),
}));

import handler from "../../../../api/src/pages/api/v1/auth/session";

describe("Auth session API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConnectDB.mockResolvedValue(undefined);
  });

  it("returns 204 for OPTIONS", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "OPTIONS",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(204);
  });

  it("returns 405 for non-GET methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Method not allowed");
  });

  it("returns 401 when Authorization header is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("No token provided");
  });

  it("returns 401 when token verification fails", async () => {
    mockVerifyToken.mockImplementation(() => {
      throw new Error("invalid");
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { authorization: "Bearer bad" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Invalid or expired token");
  });

  it("returns 404 when user is not in the database", async () => {
    mockVerifyToken.mockReturnValue({ sub: "missing-id" });
    mockGetUserByIdFromDB.mockResolvedValue({ data: null, error: null });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { authorization: "Bearer valid.jwt" },
    });

    await handler(req, res);

    expect(mockConnectDB).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("User not found");
  });

  it("returns 200 with session user fields when token and user are valid", async () => {
    mockVerifyToken.mockReturnValue({ sub: "user-id-1" });
    mockGetUserByIdFromDB.mockResolvedValue({
      data: {
        _id: { toString: () => "user-id-1" },
        email: "a@b.com",
        name: "Ada",
        image: "https://img",
        isOnboarded: true,
        userName: "ada",
        occupation: "dev",
        purpose: "learn",
        contactNo: "1",
        prepYatra: {},
        dsaYatra: {},
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { authorization: "Bearer valid.jwt" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toMatchObject({
      id: "user-id-1",
      email: "a@b.com",
      name: "Ada",
      isOnboarded: true,
      userName: "ada",
    });
  });
});
