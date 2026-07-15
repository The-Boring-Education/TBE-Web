import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAllEnrolledCoursesFromDB = vi.fn();
const mockGetAllEnrolledProjectsFromDB = vi.fn();
const mockGetAllEnrolledSheetsFromDB = vi.fn();
const mockGetUserByIdFromDB = vi.fn();
const mockGetUserPlaylistsFromDB = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    RESOURCE_CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
  },
}));

vi.mock("../../../../api/src/lib/database", () => ({
  getAllEnrolledCoursesFromDB: (...args: unknown[]) =>
    mockGetAllEnrolledCoursesFromDB(...args),
  getAllEnrolledProjectsFromDB: (...args: unknown[]) =>
    mockGetAllEnrolledProjectsFromDB(...args),
  getAllEnrolledSheetsFromDB: (...args: unknown[]) =>
    mockGetAllEnrolledSheetsFromDB(...args),
  getUserByIdFromDB: (...args: unknown[]) => mockGetUserByIdFromDB(...args),
  getUserPlaylistsFromDB: (...args: unknown[]) =>
    mockGetUserPlaylistsFromDB(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>,
  ) => handler,
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

import handler from "../../../../api/src/pages/api/v1/user/dashboard";

describe("User Dashboard API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("missing auth token → 401", async () => {
    const { getAuthenticatedUserId } =
      await import("../../../../api/src/middleware/userAuth");
    (getAuthenticatedUserId as ReturnType<typeof vi.fn>).mockImplementationOnce(
      (_req: NextApiRequest, res: NextApiResponse) => {
        res.statusCode = 401;
        (res as any).json({
          status: false,
          message: "Authentication required",
        });
        return null;
      },
    );

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
  });

  it("getUserByIdFromDB error → 500", async () => {
    mockGetUserByIdFromDB.mockResolvedValue({
      data: null,
      error: new Error("DB error"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
    expect(data.message).toBe("Error while fetching user");
  });

  it("full dashboard with all sources (200)", async () => {
    mockGetUserByIdFromDB.mockResolvedValue({
      data: { _id: "u1" },
      error: null,
    });
    mockGetAllEnrolledCoursesFromDB.mockResolvedValue({
      data: [{ _id: "c1", title: "Course 1" }],
      error: null,
    });
    mockGetAllEnrolledProjectsFromDB.mockResolvedValue({
      data: [{ _id: "p1", title: "Project 1" }],
      error: null,
    });
    mockGetAllEnrolledSheetsFromDB.mockResolvedValue({
      data: [{ _id: "s1", title: "Sheet 1" }],
      error: null,
    });
    mockGetUserPlaylistsFromDB.mockResolvedValue({
      data: [{ _id: "pl1", title: "Playlist 1" }],
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
    expect(data.data.enrolledCourses).toHaveLength(1);
    expect(data.data.enrolledProjects).toHaveLength(1);
    expect(data.data.enrolledSheets).toHaveLength(1);
    expect(data.data.enrolledPlaylists).toHaveLength(1);
  });

  it("dashboard with some empty sources (200)", async () => {
    mockGetUserByIdFromDB.mockResolvedValue({
      data: { _id: "u1" },
      error: null,
    });
    mockGetAllEnrolledCoursesFromDB.mockResolvedValue({
      data: [{ _id: "c1" }],
      error: null,
    });
    mockGetAllEnrolledProjectsFromDB.mockResolvedValue({
      data: null,
      error: null,
    });
    mockGetAllEnrolledSheetsFromDB.mockResolvedValue({
      data: [],
      error: null,
    });
    mockGetUserPlaylistsFromDB.mockResolvedValue({
      data: null,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data.enrolledCourses).toHaveLength(1);
    expect(data.data.enrolledProjects).toEqual([]);
    expect(data.data.enrolledSheets).toEqual([]);
    expect(data.data.enrolledPlaylists).toEqual([]);
  });

  it("dashboard with all empty sources (200)", async () => {
    mockGetUserByIdFromDB.mockResolvedValue({
      data: { _id: "u1" },
      error: null,
    });
    mockGetAllEnrolledCoursesFromDB.mockResolvedValue({
      data: null,
      error: null,
    });
    mockGetAllEnrolledProjectsFromDB.mockResolvedValue({
      data: null,
      error: null,
    });
    mockGetAllEnrolledSheetsFromDB.mockResolvedValue({
      data: null,
      error: null,
    });
    mockGetUserPlaylistsFromDB.mockResolvedValue({
      data: null,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data.enrolledCourses).toEqual([]);
    expect(data.data.enrolledProjects).toEqual([]);
    expect(data.data.enrolledSheets).toEqual([]);
    expect(data.data.enrolledPlaylists).toEqual([]);
  });

  it("internal error → 500", async () => {
    mockGetUserByIdFromDB.mockResolvedValue({
      data: { _id: "u1" },
      error: null,
    });
    mockGetAllEnrolledCoursesFromDB.mockRejectedValue(new Error("Unexpected"));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
  });

  it("partial data (courses only) → 200", async () => {
    mockGetUserByIdFromDB.mockResolvedValue({
      data: { _id: "u1" },
      error: null,
    });
    mockGetAllEnrolledCoursesFromDB.mockResolvedValue({
      data: [{ _id: "c1" }, { _id: "c2" }],
      error: null,
    });
    mockGetAllEnrolledProjectsFromDB.mockResolvedValue({
      data: null,
      error: null,
    });
    mockGetAllEnrolledSheetsFromDB.mockResolvedValue({
      data: null,
      error: null,
    });
    mockGetUserPlaylistsFromDB.mockResolvedValue({
      data: null,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data.enrolledCourses).toHaveLength(2);
    expect(data.data.enrolledProjects).toEqual([]);
    expect(data.data.enrolledSheets).toEqual([]);
    expect(data.data.enrolledPlaylists).toEqual([]);
  });

  it("partial data (playlists only) → 200", async () => {
    mockGetUserByIdFromDB.mockResolvedValue({
      data: { _id: "u1" },
      error: null,
    });
    mockGetAllEnrolledCoursesFromDB.mockResolvedValue({
      data: null,
      error: null,
    });
    mockGetAllEnrolledProjectsFromDB.mockResolvedValue({
      data: null,
      error: null,
    });
    mockGetAllEnrolledSheetsFromDB.mockResolvedValue({
      data: null,
      error: null,
    });
    mockGetUserPlaylistsFromDB.mockResolvedValue({
      data: [{ _id: "pl1" }],
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data.enrolledCourses).toEqual([]);
    expect(data.data.enrolledProjects).toEqual([]);
    expect(data.data.enrolledSheets).toEqual([]);
    expect(data.data.enrolledPlaylists).toHaveLength(1);
  });
});
