import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/middleware/requestLogger", () => ({
  withApiHandler: (handler: unknown) => handler,
}));

vi.mock("@/middleware/admin", () => ({
  withVerifiedAdminAuth: (handler: unknown) => handler,
  ensureAdminAccess: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/database", () => ({
  getAllDocumentsFromModel: vi.fn().mockResolvedValue([]),
  getTotalCountFromModel: vi.fn().mockResolvedValue(0),
  User: {},
  Course: {},
  Project: {},
  InterviewSheet: {},
  UserCourse: {},
  UserProject: {},
  UserSheet: {},
}));

vi.mock("@/lib/utils", () => ({
  sendAPIResponse: (obj: Record<string, unknown>) => obj,
}));

import dashboardHandler from "../../../../api/src/pages/api/v1/admin/dashboard";

describe("Admin dashboard route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 405 for unsupported methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      query: { type: "overview" },
    });

    await dashboardHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
