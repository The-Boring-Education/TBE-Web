import type { NextApiHandler } from "next";
import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import dsayatraOnboardingHandler from "../../../../api/src/pages/api/v1/dsayatra/onboarding";
import userOnboardingHandler from "../../../../api/src/pages/api/v1/user/onboarding";

const mockGetDYUserByIdFromDB = vi.fn();
const mockUpdateDYUserByIdInDB = vi.fn();
const mockOnboardPrepYatraUserTODB = vi.fn();
const mockUserFindById = vi.fn();

vi.mock("../../../../api/src/lib/database/models/User", () => ({
  default: {
    findById: (...args: unknown[]) => mockUserFindById(...args),
  },
}));

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

vi.mock("../../../../api/src/lib/database", async () => {
  const { buildUserSocialProfileUpdate } =
    await import("../../../../api/src/lib/utils/userSocialProfile");
  return {
    buildUserSocialProfileUpdate,
    getDYUserByIdFromDB: (...args: unknown[]) =>
      mockGetDYUserByIdFromDB(...args),
    updateDYUserByIdInDB: (...args: unknown[]) =>
      mockUpdateDYUserByIdInDB(...args),
    onboardPrepYatraUserTODB: (...args: unknown[]) =>
      mockOnboardPrepYatraUserTODB(...args),
    getUserByUserNameFromDB: vi.fn(),
    onboardUserToDB: vi.fn(),
  };
});

vi.mock("../../../../api/src/lib/constants", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../api/src/lib/constants")>();
  return {
    ...actual,
    apiStatusCodes: {
      ...actual.apiStatusCodes,
      OKAY: 200,
      BAD_REQUEST: 400,
      NOT_FOUND: 404,
      INTERNAL_SERVER_ERROR: 500,
    },
  };
});

const validDsaBody = {
  userId: "u1",
  name: "Ada Lovelace",
  username: "ada",
  timeline: "6Months",
  target: "Startups",
  preferredLanguage: "C++",
  experienceLevel: "Fresher (0-1 yr)",
  targetTopics: ["ARRAY"],
  linkedInUrl: "https://www.linkedin.com/in/ada",
  githubUrl: "https://github.com/ada",
  leetCodeUrl: "https://leetcode.com/ada",
};

describe("POST /api/v1/dsayatra/onboarding (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when required fields are missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "u1" },
    });

    await dsayatraOnboardingHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const body = JSON.parse(res._getData() as string);
    expect(body.status).toBe(false);
    expect(mockUpdateDYUserByIdInDB).not.toHaveBeenCalled();
  });

  it("persists social profile URLs at the User root in the update payload", async () => {
    mockGetDYUserByIdFromDB.mockResolvedValue({
      data: { _id: "u1", dsaYatra: { dyOnboarded: true } },
      error: null,
    });
    mockUpdateDYUserByIdInDB.mockResolvedValue({
      data: {
        _id: "u1",
        ...validDsaBody,
        userName: validDsaBody.username,
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: validDsaBody,
    });

    await dsayatraOnboardingHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockUpdateDYUserByIdInDB).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({
        name: validDsaBody.name,
        userName: validDsaBody.username,
        linkedInUrl: validDsaBody.linkedInUrl,
        githubUrl: validDsaBody.githubUrl,
        leetCodeUrl: validDsaBody.leetCodeUrl,
        "dsaYatra.dyOnboarded": true,
        "dsaYatra.timeline": "6Months",
      }),
    );

    const body = JSON.parse(res._getData() as string);
    expect(body.status).toBe(true);
    expect(body.data.user.linkedInUrl).toBe(validDsaBody.linkedInUrl);
  });
});

/** `/user/onboarding` validates the id as a Mongo ObjectId before touching the DB. */
const LEGACY_USER_ID = "507f1f77bcf86cd799439011";

describe("PUT /api/v1/user/onboarding legacy Prep Yatra (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes linkedInUrl via onboardPrepYatraUserTODB at the User root", async () => {
    mockOnboardPrepYatraUserTODB.mockResolvedValue({
      data: {
        _id: LEGACY_USER_ID,
        linkedInUrl: "https://www.linkedin.com/in/legacy",
        prepYatra: { pyOnboarded: true, workDomain: "TECH" },
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PUT",
      query: { userId: LEGACY_USER_ID },
      body: {
        workDomain: "TECH",
        linkedInUrl: "https://www.linkedin.com/in/legacy",
      },
    });

    await userOnboardingHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockOnboardPrepYatraUserTODB).toHaveBeenCalledWith(
      LEGACY_USER_ID,
      "TECH",
      "https://www.linkedin.com/in/legacy",
      undefined,
    );
  });

  it("rejects a userId that is not a Mongo ObjectId", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PUT",
      query: { userId: "u1" },
      body: { workDomain: "TECH" },
    });

    await userOnboardingHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(mockOnboardPrepYatraUserTODB).not.toHaveBeenCalled();
  });
});
