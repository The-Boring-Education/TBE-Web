import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockHandleGamificationPoints = vi.fn();
const mockUpdateUserCourseChapterInDB = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  handleGamificationPoints: (...args: unknown[]) =>
    mockHandleGamificationPoints(...args),
  updateUserCourseChapterInDB: (...args: unknown[]) =>
    mockUpdateUserCourseChapterInDB(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
  },
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
  isAdminEmail: vi.fn().mockResolvedValue(false),
}));

import handler from "../../../../api/src/pages/api/v1/user/shiksha/course";

describe("User Shiksha Course API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHandleGamificationPoints.mockResolvedValue(undefined);
  });

  it("rejects non-PATCH with 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        userId: "user-1",
        courseId: "course-1",
        chapterId: "chapter-1",
        isCompleted: true,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Method");
  });

  it("returns 200 on successful chapter update", async () => {
    mockUpdateUserCourseChapterInDB.mockResolvedValue({
      data: { updated: true },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      body: {
        userId: "user-1",
        courseId: "course-1",
        chapterId: "chapter-1",
        isCompleted: true,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.message).toBe("Chapter status updated successfully");
  });

  it("returns 500 when update errors", async () => {
    mockUpdateUserCourseChapterInDB.mockResolvedValue({
      data: null,
      error: new Error("Update failed"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      body: {
        userId: "user-1",
        courseId: "course-1",
        chapterId: "chapter-1",
        isCompleted: true,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Failed to update chapter status");
  });

  it("calls gamification with correct args when isCompleted true", async () => {
    mockUpdateUserCourseChapterInDB.mockResolvedValue({
      data: { updated: true },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      body: {
        userId: "user-1",
        courseId: "course-1",
        chapterId: "chapter-1",
        isCompleted: true,
      },
    });

    await handler(req, res);

    expect(mockHandleGamificationPoints).toHaveBeenCalledWith(
      true,
      "user-1",
      "COMPLETE_COURSE_CHAPTER",
    );
  });

  it("calls gamification with isCompleted false", async () => {
    mockUpdateUserCourseChapterInDB.mockResolvedValue({
      data: { updated: true },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      body: {
        userId: "user-1",
        courseId: "course-1",
        chapterId: "chapter-1",
        isCompleted: false,
      },
    });

    await handler(req, res);

    expect(mockHandleGamificationPoints).toHaveBeenCalledWith(
      false,
      "user-1",
      "COMPLETE_COURSE_CHAPTER",
    );
  });

  it("returns 500 on internal error", async () => {
    mockUpdateUserCourseChapterInDB.mockRejectedValue(
      new Error("Unexpected error"),
    );

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      body: {
        userId: "user-1",
        courseId: "course-1",
        chapterId: "chapter-1",
        isCompleted: true,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Failed to update chapter status");
  });

  it("returns updated data on 200", async () => {
    const updatedData = { chapterId: "chapter-1", isCompleted: true };
    mockUpdateUserCourseChapterInDB.mockResolvedValue({
      data: updatedData,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      body: {
        userId: "user-1",
        courseId: "course-1",
        chapterId: "chapter-1",
        isCompleted: true,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toEqual(updatedData);
  });
});
