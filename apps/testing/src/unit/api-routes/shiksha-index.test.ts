import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAddACourseToDB = vi.fn();
const mockGetAllCourseFromDB = vi.fn();
const mockGetAllEnrolledCoursesFromDB = vi.fn();
const mockGetCourseBySlugFromDB = vi.fn();
const mockGetCourseBySlugWithUserFromDB = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

vi.mock("../../../../api/src/lib/database", () => ({
  addACourseToDB: (...args: unknown[]) => mockAddACourseToDB(...args),
  getAllCourseFromDB: (...args: unknown[]) => mockGetAllCourseFromDB(...args),
  getAllEnrolledCoursesFromDB: (...args: unknown[]) =>
    mockGetAllEnrolledCoursesFromDB(...args),
  getCourseBySlugFromDB: (...args: unknown[]) =>
    mockGetCourseBySlugFromDB(...args),
  getCourseBySlugWithUserFromDB: (...args: unknown[]) =>
    mockGetCourseBySlugWithUserFromDB(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>,
  ) => handler,
}));

import handler from "../../../../api/src/pages/api/v1/shiksha/index";

describe("Shiksha Index API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unsupported methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PUT",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Not Allowed");
  });

  it("POST - course already exists (slug found) returns 400", async () => {
    mockGetCourseBySlugFromDB.mockResolvedValue({
      error: null,
      data: { _id: "existing" },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { slug: "existing-slug", title: "Course" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Course already exists");
    expect(mockAddACourseToDB).not.toHaveBeenCalled();
  });

  it("POST - add course successfully returns 200", async () => {
    mockGetCourseBySlugFromDB.mockResolvedValue({ error: "Course not found" });
    mockAddACourseToDB.mockResolvedValue({
      data: { _id: "new-course", slug: "new-slug", title: "New Course" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { slug: "new-slug", title: "New Course" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data.slug).toBe("new-slug");
    expect(data.message).toBe("Course added successfully");
  });

  it("POST - addACourseToDB error returns 500", async () => {
    mockGetCourseBySlugFromDB.mockResolvedValue({ error: "Course not found" });
    mockAddACourseToDB.mockResolvedValue({
      data: null,
      error: "DB error",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { slug: "new-slug", title: "New Course" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Course not added");
  });

  it("GET with slug - course found returns 200", async () => {
    const courseData = {
      _id: "c1",
      slug: "test-slug",
      title: "Test",
      isEnrolled: false,
    };
    mockGetCourseBySlugWithUserFromDB.mockResolvedValue({
      data: courseData,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { slug: "test-slug" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data.slug).toBe("test-slug");
  });

  it("GET with slug - course not found returns 404", async () => {
    mockGetCourseBySlugWithUserFromDB.mockResolvedValue({
      data: null,
      error: "Course not found",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { slug: "missing-slug" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Course not found");
  });

  it("GET without slug - all courses, no userId returns 200", async () => {
    const courseDoc = {
      _id: { toString: () => "course-1" },
      toObject: () => ({ _id: "course-1", title: "Course 1", slug: "c1" }),
    };
    mockGetAllCourseFromDB.mockResolvedValue({
      data: [courseDoc],
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].title).toBe("Course 1");
    expect(mockGetAllEnrolledCoursesFromDB).not.toHaveBeenCalled();
  });

  it("GET without slug - with userId, enrolled overlay merge returns 200 with isEnrolled flag", async () => {
    const courseDoc1 = {
      _id: { toString: () => "course-1" },
      toObject: () => ({ _id: "course-1", title: "Course 1", slug: "c1" }),
    };
    const courseDoc2 = {
      _id: { toString: () => "course-2" },
      toObject: () => ({ _id: "course-2", title: "Course 2", slug: "c2" }),
    };
    mockGetAllCourseFromDB.mockResolvedValue({
      data: [courseDoc1, courseDoc2],
      error: null,
    });
    mockGetAllEnrolledCoursesFromDB.mockResolvedValue({
      data: [
        {
          _id: { toString: () => "course-1" },
          toObject: () => ({ _id: "course-1", title: "Course 1" }),
        },
      ],
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "user-123" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    const enrolledCourse = data.data.find(
      (c: { _id: string }) => c._id === "course-1",
    );
    const notEnrolledCourse = data.data.find(
      (c: { _id: string }) => c._id === "course-2",
    );
    expect(enrolledCourse?.isEnrolled).toBe(true);
    expect(notEnrolledCourse?.isEnrolled).toBeUndefined();
  });

  it("GET - getAllCourseFromDB error returns 500", async () => {
    mockGetAllCourseFromDB.mockResolvedValue({
      data: null,
      error: "DB error",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Failed while fetching courses");
  });

  it("GET - getAllEnrolledCoursesFromDB error returns 500", async () => {
    const courseDoc = {
      _id: { toString: () => "course-1" },
      toObject: () => ({ _id: "course-1", title: "Course 1" }),
    };
    mockGetAllCourseFromDB.mockResolvedValue({
      data: [courseDoc],
      error: null,
    });
    mockGetAllEnrolledCoursesFromDB.mockResolvedValue({
      data: null,
      error: "Enrolled fetch error",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "user-123" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Failed while fetching enrolled courses");
  });
});
