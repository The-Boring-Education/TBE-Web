/**
 * Integration test: the Course Bundle import and export routes are
 * admin-guarded, reject an invalid Bundle with the validator's field-level
 * errors without writing anything, and pass the dry-run flag through to the
 * query layer.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/utils", () => ({
  sendAPIResponse: (obj: Record<string, unknown>) => obj,
}));

vi.mock("@/lib/utils/functions", () => ({
  sendAPIResponse: (obj: Record<string, unknown>) => obj,
}));

vi.mock("@/lib/utils/cors", () => ({
  cors: vi.fn(),
}));

vi.mock("@/middleware/api", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    request: vi.fn(),
  },
}));

const mockCaptureAuthError = vi.fn();
vi.mock("@/lib/utils/sentry", () => ({
  captureAuthError: (...args: unknown[]) => mockCaptureAuthError(...args),
  captureAPIError: vi.fn(),
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

const mockImportCourseBundleToDB = vi.fn();
const mockExportCourseBundleFromDB = vi.fn();

vi.mock("@/lib/database", () => ({
  importCourseBundleToDB: (...args: unknown[]) =>
    mockImportCourseBundleToDB(...args),
  exportCourseBundleFromDB: (...args: unknown[]) =>
    mockExportCourseBundleFromDB(...args),
}));

import exportHandler from "@api/pages/api/v1/admin/course-bundle/export";
import importHandler from "@api/pages/api/v1/admin/course-bundle/import";

const TOKEN = "test-jwt";
const authHeaders = () => ({ authorization: ["Bearer", TOKEN].join(" ") });

const validBundle = {
  schemaVersion: "shiksha-course@1",
  course: {
    slug: "react-basics",
    title: "React Basics",
    description: "Learn React",
    coverImageURL: "https://example.com/cover.png",
    roadmap: "Frontend",
    difficulty: "Beginner",
  },
  chapters: [{ chapterKey: "intro", title: "Intro", content: "## Intro" }],
};

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

describe("Course Bundle import/export routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWarmAdminEmailCache.mockResolvedValue(undefined);
    mockIsAdminEmail.mockResolvedValue(false);
    mockImportCourseBundleToDB.mockResolvedValue({
      data: { dryRun: false, slug: "react-basics", course: "CREATED" },
    });
    mockExportCourseBundleFromDB.mockResolvedValue({ data: validBundle });
  });

  it("rejects an unauthenticated import with 401 and imports nothing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { bundle: validBundle },
    });

    await importHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockImportCourseBundleToDB).not.toHaveBeenCalled();
    expect(mockCaptureAuthError).toHaveBeenCalled();
  });

  it("rejects a non-admin import with 403 and imports nothing", async () => {
    asNonAdmin();

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { bundle: validBundle },
      headers: authHeaders(),
    });

    await importHandler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(mockImportCourseBundleToDB).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated export with 401", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { slug: "react-basics" },
    });

    await exportHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockExportCourseBundleFromDB).not.toHaveBeenCalled();
  });

  it("rejects a non-admin export with 403", async () => {
    asNonAdmin();

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { slug: "react-basics" },
      headers: authHeaders(),
    });

    await exportHandler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(mockExportCourseBundleFromDB).not.toHaveBeenCalled();
  });

  it("returns the validator's field-level errors and writes nothing for an invalid bundle", async () => {
    asAdmin();

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { bundle: { ...validBundle, course: { slug: "React Basics" } } },
      headers: authHeaders(),
    });

    await importHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(mockImportCourseBundleToDB).not.toHaveBeenCalled();

    const body = res._getJSONData() as {
      error: { field: string; message: string }[];
    };
    expect(body.error.map((item) => item.field)).toContain("course.slug");
    expect(body.error.map((item) => item.field)).toContain("course.title");
  });

  it("passes the dry-run flag through and returns the report", async () => {
    asAdmin();
    mockImportCourseBundleToDB.mockResolvedValue({
      data: { dryRun: true, slug: "react-basics", course: "CREATED" },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { bundle: validBundle, dryRun: true },
      headers: authHeaders(),
    });

    await importHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockImportCourseBundleToDB).toHaveBeenCalledWith({
      bundle: validBundle,
      dryRun: true,
    });
    expect(
      (res._getJSONData() as { data: { dryRun: boolean } }).data.dryRun,
    ).toBe(true);
  });

  it("exports a bundle for an admin caller", async () => {
    asAdmin();

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { slug: "react-basics" },
      headers: authHeaders(),
    });

    await exportHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockExportCourseBundleFromDB).toHaveBeenCalledWith("react-basics");
    expect((res._getJSONData() as { data: unknown }).data).toEqual(validBundle);
  });

  it("requires a slug on export", async () => {
    asAdmin();

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: authHeaders(),
    });

    await exportHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(mockExportCourseBundleFromDB).not.toHaveBeenCalled();
  });

  it("returns 404 when the exported course does not exist", async () => {
    asAdmin();
    mockExportCourseBundleFromDB.mockResolvedValue({
      error: "Course not found",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { slug: "unknown-course" },
      headers: authHeaders(),
    });

    await exportHandler(req, res);

    expect(res._getStatusCode()).toBe(404);
  });
});
