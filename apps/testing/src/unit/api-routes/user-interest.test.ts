import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreateUserInterestInDB = vi.fn();
const mockGetUserInterestsFromDB = vi.fn();
const mockUpdateUserInterestInDB = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    RESOURCE_CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

vi.mock("../../../../api/src/lib/database", () => ({
  createUserInterestInDB: (...args: unknown[]) =>
    mockCreateUserInterestInDB(...args),
  getUserInterestsFromDB: (...args: unknown[]) =>
    mockGetUserInterestsFromDB(...args),
  updateUserInterestInDB: (...args: unknown[]) =>
    mockUpdateUserInterestInDB(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    request: vi.fn(),
  },
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (handler: unknown) => handler,
}));

vi.mock("../../../../api/src/lib/services/admin-cache", () => ({
  isAdminEmail: vi.fn().mockResolvedValue(false),
  warmAdminEmailCache: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../api/src/middleware/admin", () => ({
  verifyAuthenticatedUser: vi.fn().mockImplementation((req) => {
    const userId = req.query?.userId || req.body?.userId || "u1";
    return {
      sub: userId,
      email: "test@example.com",
      name: "Test User",
      type: "access",
    };
  }),
  withUserAuth: (handler: any) => handler,
  isAdminEmail: vi.fn().mockResolvedValue(false),
}));

import handler from "../../../../api/src/pages/api/v1/user/interest";

describe("User Interest API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unsupported methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "DELETE",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Not Allowed");
  });

  it("POST - missing required fields returns 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("userId, eventType, source");
    expect(mockCreateUserInterestInDB).not.toHaveBeenCalled();
  });

  it("POST - successful creation returns 201", async () => {
    const mockData = {
      _id: "int_1",
      userId: "u1",
      eventType: "click",
      source: "home",
    };
    mockCreateUserInterestInDB.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "u1", eventType: "click", source: "home" },
    });
    (req as unknown as { connection?: { remoteAddress?: string } }).connection =
      {
        remoteAddress: undefined,
      };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toEqual(mockData);
    expect(mockCreateUserInterestInDB).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        eventType: "click",
        source: "home",
      }),
    );
  });

  it("POST - extracts IP from x-forwarded-for header", async () => {
    mockCreateUserInterestInDB.mockResolvedValue({ data: {}, error: null });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { "x-forwarded-for": "192.168.1.1, 10.0.0.1" },
      body: {
        userId: "u1",
        eventType: "click",
        source: "home",
      },
    });

    await handler(req, res);

    expect(mockCreateUserInterestInDB).toHaveBeenCalledWith(
      expect.objectContaining({ ipAddress: "192.168.1.1" }),
    );
  });

  it("POST - extracts IP from x-real-ip header when x-forwarded-for absent", async () => {
    mockCreateUserInterestInDB.mockResolvedValue({ data: {}, error: null });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { "x-real-ip": "10.0.0.5" },
      body: {
        userId: "u1",
        eventType: "click",
        source: "home",
      },
    });

    await handler(req, res);

    expect(mockCreateUserInterestInDB).toHaveBeenCalledWith(
      expect.objectContaining({ ipAddress: "10.0.0.5" }),
    );
  });

  it("POST - defaults IP to unknown when no headers", async () => {
    mockCreateUserInterestInDB.mockResolvedValue({ data: {}, error: null });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        userId: "u1",
        eventType: "click",
        source: "home",
      },
    });
    (req as unknown as { connection?: { remoteAddress?: string } }).connection =
      {
        remoteAddress: undefined,
      };

    await handler(req, res);

    expect(mockCreateUserInterestInDB).toHaveBeenCalledWith(
      expect.objectContaining({ ipAddress: "unknown" }),
    );
  });

  it("POST - extracts user-agent header", async () => {
    mockCreateUserInterestInDB.mockResolvedValue({ data: {}, error: null });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { "user-agent": "Mozilla/5.0 Test Browser" },
      body: {
        userId: "u1",
        eventType: "click",
        source: "home",
      },
    });
    (req as any).connection = { remoteAddress: undefined };

    await handler(req, res);

    expect(mockCreateUserInterestInDB).toHaveBeenCalledWith(
      expect.objectContaining({ userAgent: "Mozilla/5.0 Test Browser" }),
    );
  });

  it("POST - createUserInterestInDB error returns 500", async () => {
    mockCreateUserInterestInDB.mockResolvedValue({
      data: null,
      error: new Error("DB failure"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "u1", eventType: "click", source: "home" },
    });
    (req as any).connection = { remoteAddress: undefined };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
    expect(data.message).toContain("Failed to create");
  });

  it("GET - successful with default pagination returns 200", async () => {
    const mockData = { interests: [], total: 0 };
    mockGetUserInterestsFromDB.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toEqual(mockData);
    expect(mockGetUserInterestsFromDB).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        page: 1,
        limit: 10,
      }),
    );
  });

  it("GET - parses isActive=true as boolean true", async () => {
    mockGetUserInterestsFromDB.mockResolvedValue({
      data: { interests: [] },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1", isActive: "true" },
    });

    await handler(req, res);

    expect(mockGetUserInterestsFromDB).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true }),
    );
  });

  it("GET - parses isActive=false as boolean false", async () => {
    mockGetUserInterestsFromDB.mockResolvedValue({
      data: { interests: [] },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1", isActive: "false" },
    });

    await handler(req, res);

    expect(mockGetUserInterestsFromDB).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false }),
    );
  });

  it("GET - getUserInterestsFromDB error returns 500", async () => {
    mockGetUserInterestsFromDB.mockResolvedValue({
      data: null,
      error: new Error("DB failure"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
    expect(data.message).toContain("Failed to get");
  });

  it("PATCH - missing fields returns 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      body: { interestId: "int_1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("interestId, isActive");
    expect(mockUpdateUserInterestInDB).not.toHaveBeenCalled();
  });

  it("PATCH - interest not found returns 404", async () => {
    mockUpdateUserInterestInDB.mockResolvedValue({
      data: null,
      error: "Interest not found",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      body: { interestId: "int_missing", isActive: false },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
    expect(data.message).toBe("Interest not found");
  });

  it("PATCH - successful update returns 200", async () => {
    const mockData = { _id: "int_1", isActive: false };
    mockUpdateUserInterestInDB.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      body: { interestId: "int_1", isActive: false },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toEqual(mockData);
    expect(mockUpdateUserInterestInDB).toHaveBeenCalledWith(
      "int_1",
      false,
      "u1",
    );
  });
});
