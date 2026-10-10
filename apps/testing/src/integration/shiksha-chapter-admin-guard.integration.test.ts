import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration test: Shiksha chapter write routes must require an admin.
 * Unauthenticated callers get 401, authenticated non-admins get 403 and
 * no database write happens in either case.
 */

vi.mock("@/lib/utils", () => ({
  sendAPIResponse: (obj: Record<string, unknown>) => obj,
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

const mockCaptureAuthError = vi.fn();
vi.mock("@/lib/utils/sentry", () => ({
  captureAuthError: (...args: unknown[]) => mockCaptureAuthError(...args),
}));

const mockVerifyToken = vi.fn();
vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: (...args: unknown[]) => mockVerifyToken(...args),
}));

const mockIsAdminEmail = vi.fn();
const mockWarmAdminEmailCache = vi.fn();
vi.mock("@/lib/services/admin-cache", () => ({
  isAdminEmail: (...args: unknown[]) => mockIsAdminEmail(...args),
  warmAdminEmailCache: (...args: unknown[]) => mockWarmAdminEmailCache(...args),
}));

const mockAddChapterToCourseInDB = vi.fn();
const mockUpdateCourseChapterInDB = vi.fn();
const mockDeleteCourseChapterByIdFromDB = vi.fn();
const mockGetACourseFromDBById = vi.fn();

vi.mock("@/lib/database", () => ({
  addChapterToCourseInDB: (...args: unknown[]) =>
    mockAddChapterToCourseInDB(...args),
  updateCourseChapterInDB: (...args: unknown[]) =>
    mockUpdateCourseChapterInDB(...args),
  deleteCourseChapterByIdFromDB: (...args: unknown[]) =>
    mockDeleteCourseChapterByIdFromDB(...args),
  getACourseFromDBById: (...args: unknown[]) =>
    mockGetACourseFromDBById(...args),
}));

vi.mock("@/middleware/requestLogger", () => ({
  withApiHandler: (
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>,
  ) => handler,
}));

import chapterByIdHandler from "@api/pages/api/v1/shiksha/[courseId]/chapter/[chapterId]/index";
import chapterBulkHandler from "@api/pages/api/v1/shiksha/[courseId]/chapter/bulk";
import chapterHandler from "@api/pages/api/v1/shiksha/[courseId]/chapter/index";

const TOKEN = "test-jwt";
const authHeaders = () => ({ authorization: `Bearer ${TOKEN}` });
const COURSE_ID = "course-1";
const CHAPTER_ID = "chapter-1";

const asAdmin = () => {
  mockVerifyToken.mockReturnValue({
    sub: "admin-id",
    email: "admin@example.com",
    name: "Admin",
    type: "access",
  });
  mockIsAdminEmail.mockResolvedValue(true);
};

const asNonAdmin = () => {
  mockVerifyToken.mockReturnValue({
    sub: "user-id",
    email: "user@example.com",
    name: "User",
    type: "access",
  });
  mockIsAdminEmail.mockResolvedValue(false);
};

type RouteCase = {
  name: string;
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>;
  method: string;
  query: Record<string, string>;
  body: Record<string, unknown>;
  expectWrite: () => void;
};

const routes: RouteCase[] = [
  {
    name: "POST /shiksha/[courseId]/chapter",
    handler: chapterHandler as RouteCase["handler"],
    method: "POST",
    query: { courseId: COURSE_ID },
    body: { title: "Chapter" },
    expectWrite: () => expect(mockAddChapterToCourseInDB).toHaveBeenCalled(),
  },
  {
    name: "POST /shiksha/[courseId]/chapter/bulk",
    handler: chapterBulkHandler as RouteCase["handler"],
    method: "POST",
    query: { courseId: COURSE_ID },
    body: { chaptersData: [{ title: "Chapter" }] },
    expectWrite: () => expect(mockAddChapterToCourseInDB).toHaveBeenCalled(),
  },
  {
    name: "PATCH /shiksha/[courseId]/chapter/[chapterId]",
    handler: chapterByIdHandler as RouteCase["handler"],
    method: "PATCH",
    query: { courseId: COURSE_ID, chapterId: CHAPTER_ID },
    body: { title: "Updated" },
    expectWrite: () => expect(mockUpdateCourseChapterInDB).toHaveBeenCalled(),
  },
  {
    name: "DELETE /shiksha/[courseId]/chapter/[chapterId]",
    handler: chapterByIdHandler as RouteCase["handler"],
    method: "DELETE",
    query: { courseId: COURSE_ID, chapterId: CHAPTER_ID },
    body: {},
    expectWrite: () =>
      expect(mockDeleteCourseChapterByIdFromDB).toHaveBeenCalled(),
  },
];

const expectNoWrites = () => {
  expect(mockAddChapterToCourseInDB).not.toHaveBeenCalled();
  expect(mockUpdateCourseChapterInDB).not.toHaveBeenCalled();
  expect(mockDeleteCourseChapterByIdFromDB).not.toHaveBeenCalled();
};

describe("Shiksha chapter write routes admin guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWarmAdminEmailCache.mockResolvedValue(undefined);
    mockIsAdminEmail.mockResolvedValue(false);
    mockGetACourseFromDBById.mockResolvedValue({ data: { _id: COURSE_ID } });
    mockAddChapterToCourseInDB.mockResolvedValue({ data: { _id: CHAPTER_ID } });
    mockUpdateCourseChapterInDB.mockResolvedValue({
      data: { _id: CHAPTER_ID },
    });
    mockDeleteCourseChapterByIdFromDB.mockResolvedValue({
      data: { _id: CHAPTER_ID },
    });
  });

  routes.forEach((route) => {
    describe(route.name, () => {
      it("rejects unauthenticated callers with 401 and writes nothing", async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: route.method as "POST",
          query: route.query,
          body: route.body,
        });

        await route.handler(req, res);

        expect(res._getStatusCode()).toBe(401);
        expectNoWrites();
        expect(mockCaptureAuthError).toHaveBeenCalled();
      });

      it("rejects authenticated non-admin callers with 403 and writes nothing", async () => {
        asNonAdmin();

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: route.method as "POST",
          query: route.query,
          body: route.body,
          headers: authHeaders(),
        });

        await route.handler(req, res);

        expect(res._getStatusCode()).toBe(403);
        expectNoWrites();
        expect(mockCaptureAuthError).toHaveBeenCalled();
      });

      it("allows admin callers", async () => {
        asAdmin();

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: route.method as "POST",
          query: route.query,
          body: route.body,
          headers: authHeaders(),
        });

        await route.handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        route.expectWrite();
        expect(mockCaptureAuthError).not.toHaveBeenCalled();
      });
    });
  });
});
