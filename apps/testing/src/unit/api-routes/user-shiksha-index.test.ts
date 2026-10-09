import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAllEnrolledCoursesFromDB = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

vi.mock("../../../../api/src/lib/database", () => ({
  getAllEnrolledCoursesFromDB: (...args: unknown[]) =>
    mockGetAllEnrolledCoursesFromDB(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (
    fn: (req: NextApiRequest, res: NextApiResponse) => unknown,
  ) => fn,
}));

vi.mock("../../../../api/src/lib/services/admin-cache", () => ({
  isAdminEmail: vi.fn().mockResolvedValue(false),
  warmAdminEmailCache: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../api/src/middleware/admin", () => ({
  verifyAuthenticatedUser: vi.fn().mockImplementation((req) => {
    const userId = req.query?.userId || req.body?.userId || "user-1";
    return {
      sub: userId,
      email: "test@example.com",
      name: "Test User",
      type: "access",
    };
  }),
  withUserAuth: (handler: any) => handler,
}));

import handler from "../../../../api/src/pages/api/v1/user/shiksha/index";

describe("User Shiksha Index API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns enrolled courses with progress for authenticated user", async () => {
    const coursesMock = [
      {
        _id: "c1",
        name: "Test Course",
        title: "Test Course",
        slug: "test-course",
        isEnrolled: true,
        progress: {
          completed: 3,
          total: 5,
          percentage: 60,
        },
      },
    ];

    mockGetAllEnrolledCoursesFromDB.mockResolvedValue({
      data: coursesMock,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "user-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toEqual(coursesMock);
    expect(data.data[0].progress).toEqual({
      completed: 3,
      total: 5,
      percentage: 60,
    });
  });

  it("returns 500 when getAllEnrolledCoursesFromDB fails", async () => {
    mockGetAllEnrolledCoursesFromDB.mockResolvedValue({
      error: "DB error",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "user-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
