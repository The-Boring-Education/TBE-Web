import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUpdateCourseStatusInDB = vi.fn();
const mockEnsureAdminAccess = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
  },
  COURSE_STATUS: ["DRAFT", "PUBLISHED", "ARCHIVED"],
}));

vi.mock("../../../../api/src/lib/database", () => ({
  updateCourseStatusInDB: (...args: unknown[]) =>
    mockUpdateCourseStatusInDB(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/lib/utils/sentry", () => ({
  captureAPIError: vi.fn(),
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>,
  ) => handler,
}));

vi.mock("../../../../api/src/middleware/admin", () => ({
  withVerifiedAdminAuth:
    (
      handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>,
    ) =>
    async (req: NextApiRequest, res: NextApiResponse) => {
      const authorized = await mockEnsureAdminAccess(req, res);
      if (!authorized) return;
      return handler(req, res);
    },
}));

import handler from "../../../../api/src/pages/api/v1/shiksha/[courseId]/status";

describe("Shiksha Course Status API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureAdminAccess.mockResolvedValue(true);
  });

  it("is admin guarded", async () => {
    mockEnsureAdminAccess.mockImplementation(
      async (_req: NextApiRequest, res: NextApiResponse) => {
        res.status(401).json({ status: false });
        return false;
      },
    );

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      query: { courseId: "course-1" },
      body: { status: "PUBLISHED" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockUpdateCourseStatusInDB).not.toHaveBeenCalled();
  });

  it("rejects unsupported methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { courseId: "course-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it("rejects an unknown status without hitting the database", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      query: { courseId: "course-1" },
      body: { status: "LIVE" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toContain(
      "Invalid course status",
    );
    expect(mockUpdateCourseStatusInDB).not.toHaveBeenCalled();
  });

  it("transitions a course to PUBLISHED", async () => {
    mockUpdateCourseStatusInDB.mockResolvedValue({
      data: { _id: "course-1", status: "PUBLISHED" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      query: { courseId: "course-1" },
      body: { status: "PUBLISHED" },
    });

    await handler(req, res);

    expect(mockUpdateCourseStatusInDB).toHaveBeenCalledWith(
      "course-1",
      "PUBLISHED",
    );
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data.status).toBe("PUBLISHED");
  });

  it("surfaces a failed publish precondition as 400", async () => {
    mockUpdateCourseStatusInDB.mockResolvedValue({
      data: null,
      error: "Cannot publish a course with no chapters",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      query: { courseId: "course-1" },
      body: { status: "PUBLISHED" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toBe(
      "Cannot publish a course with no chapters",
    );
  });

  it("returns 404 when the course does not exist", async () => {
    mockUpdateCourseStatusInDB.mockResolvedValue({
      data: null,
      error: "Course not found",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      query: { courseId: "missing" },
      body: { status: "ARCHIVED" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
  });
});
