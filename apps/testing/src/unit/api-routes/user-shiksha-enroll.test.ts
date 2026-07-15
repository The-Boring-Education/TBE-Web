import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockEnrollInACourse = vi.fn();
const mockGetACourseFromDBById = vi.fn();
const mockGetEnrolledCourseFromDB = vi.fn();
const mockGetUserByIdFromDB = vi.fn();
const mockSendCourseEnrollmentEmail = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  enrollInACourse: (...args: unknown[]) => mockEnrollInACourse(...args),
  getACourseFromDBById: (...args: unknown[]) =>
    mockGetACourseFromDBById(...args),
  getEnrolledCourseFromDB: (...args: unknown[]) =>
    mockGetEnrolledCourseFromDB(...args),
  getUserByIdFromDB: (...args: unknown[]) => mockGetUserByIdFromDB(...args),
}));

vi.mock("../../../../api/src/lib/services", () => ({
  sendCourseEnrollmentEmail: (...args: unknown[]) =>
    mockSendCourseEnrollmentEmail(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), request: vi.fn() },
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

vi.mock("../../../../api/src/middleware/userAuth", () => ({
  getAuthenticatedUserId: vi.fn().mockReturnValue("test-user-id"),
  verifyOwnership: vi.fn().mockReturnValue(true),
}));

import handler from "../../../../api/src/pages/api/v1/user/shiksha/enroll";

describe("User Shiksha Enroll API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendCourseEnrollmentEmail.mockResolvedValue(undefined);
    mockGetUserByIdFromDB.mockResolvedValue({
      data: { email: "user@test.com", name: "Test User" },
      error: null,
    });
    mockGetACourseFromDBById.mockResolvedValue({
      data: { name: "Test Course", description: "Course desc" },
      error: null,
    });
  });

  it("rejects non-POST with 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      body: { userId: "user-1", courseId: "course-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Method");
  });

  it("returns 400 when userId is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { courseId: "course-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("userId and courseId are required");
  });

  it("returns 400 when courseId is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "user-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("userId and courseId are required");
  });

  it("returns 500 when getEnrolledCourseFromDB errors", async () => {
    mockGetEnrolledCourseFromDB.mockResolvedValue({
      data: null,
      error: new Error("DB error"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "user-1", courseId: "course-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Failed while enrolling course");
  });

  it("returns 400 when already enrolled", async () => {
    mockGetEnrolledCourseFromDB.mockResolvedValue({
      data: { _id: "enrollment-1" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "user-1", courseId: "course-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Already enrolled in course");
  });

  it("returns 500 when enrollInACourse errors", async () => {
    mockGetEnrolledCourseFromDB.mockResolvedValue({
      data: null,
      error: null,
    });
    mockEnrollInACourse.mockResolvedValue({
      data: null,
      error: new Error("Enroll failed"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "user-1", courseId: "course-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Failed while enrolling course");
  });

  it("returns 200 on successful enrollment", async () => {
    mockGetEnrolledCourseFromDB.mockResolvedValue({
      data: null,
      error: null,
    });
    mockEnrollInACourse.mockResolvedValue({
      data: { _id: "enrollment-1" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "user-1", courseId: "course-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.message).toBe("Successfully enrolled in course");
    expect(data.data._id).toBe("enrollment-1");
  });

  it("sends enrollment email with correct data", async () => {
    mockGetEnrolledCourseFromDB.mockResolvedValue({
      data: null,
      error: null,
    });
    mockEnrollInACourse.mockResolvedValue({
      data: { _id: "enrollment-1" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "user-1", courseId: "course-1" },
    });

    await handler(req, res);

    await vi.waitFor(() => {
      expect(mockSendCourseEnrollmentEmail).toHaveBeenCalledWith({
        email: "user@test.com",
        name: "Test User",
        id: "user-1",
        courseName: "Test Course",
        courseDescription: "Course desc",
      });
    });
  });

  it("returns 200 even when email fails", async () => {
    mockGetEnrolledCourseFromDB.mockResolvedValue({
      data: null,
      error: null,
    });
    mockEnrollInACourse.mockResolvedValue({
      data: { _id: "enrollment-1" },
      error: null,
    });
    mockSendCourseEnrollmentEmail.mockRejectedValue(new Error("Email failed"));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "user-1", courseId: "course-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
  });
});
