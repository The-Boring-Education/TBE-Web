import type { NextApiHandler } from "next";
import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import resumeyatraOnboardingHandler from "../../../../api/src/pages/api/v1/resumeyatra/onboarding";
import techyatraOnboardingHandler from "../../../../api/src/pages/api/v1/techyatra/onboarding";
import userOnboardingHandler from "../../../../api/src/pages/api/v1/user/onboarding";

const mockGetUserByUserNameFromDB = vi.fn();
const mockGetUserByIdFromDB = vi.fn();
const mockFindByIdAndUpdate = vi.fn();

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (fn: NextApiHandler) => fn,
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

vi.mock("../../../../api/src/lib/database", () => ({
  getUserByUserNameFromDB: (...args: unknown[]) =>
    mockGetUserByUserNameFromDB(...args),
  getUserByIdFromDB: (...args: unknown[]) => mockGetUserByIdFromDB(...args),
}));

vi.mock("../../../../api/src/lib/database/models/User", () => ({
  default: {
    findByIdAndUpdate: (...args: unknown[]) => mockFindByIdAndUpdate(...args),
  },
}));

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

describe("onboarding API routes (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/v1/user/onboarding returns 400 when userName is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {},
    });

    await userOnboardingHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const body = JSON.parse(res._getData() as string);
    expect(body.status).toBe(false);
    expect(body.message).toMatch(/required/i);
  });

  it("GET /api/v1/user/onboarding returns status true when username is available", async () => {
    mockGetUserByUserNameFromDB.mockResolvedValue({
      data: true,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userName: "fresh-name-123" },
    });

    await userOnboardingHandler(req, res);

    expect(mockGetUserByUserNameFromDB).toHaveBeenCalledWith("fresh-name-123");
    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData() as string);
    expect(body.status).toBe(true);
  });

  it("GET /api/v1/user/onboarding returns status false when username is taken", async () => {
    mockGetUserByUserNameFromDB.mockResolvedValue({
      data: null,
      error: "Username already taken",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userName: "taken" },
    });

    await userOnboardingHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData() as string);
    expect(body.status).toBe(false);
  });

  it("POST /api/v1/techyatra/onboarding completes when user exists", async () => {
    mockGetUserByIdFromDB.mockResolvedValue({
      data: { _id: "u1", from: undefined },
      error: null,
    });
    mockFindByIdAndUpdate.mockResolvedValue({
      _id: "u1",
      techYatra: { tyOnboarded: true, focus: "roadmaps" },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        userId: "u1",
        focus: "roadmaps",
        from: "techyatra",
      },
    });

    await techyatraOnboardingHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData() as string);
    expect(body.status).toBe(true);
    expect(mockFindByIdAndUpdate).toHaveBeenCalled();
  });

  it("POST /api/v1/resumeyatra/onboarding returns 400 when experienceBand is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "u1" },
    });

    await resumeyatraOnboardingHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const body = JSON.parse(res._getData() as string);
    expect(body.status).toBe(false);
    expect(body.message).toMatch(/experienceBand/i);
  });
});
