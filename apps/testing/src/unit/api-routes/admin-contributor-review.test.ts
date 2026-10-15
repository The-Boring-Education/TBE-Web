import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockEnsureAdminAccess = vi.fn();
const mockReviewContributionInDB = vi.fn();

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (fn: unknown) => fn,
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/middleware/admin", () => ({
  ensureAdminAccess: (req: NextApiRequest, res: NextApiResponse) =>
    mockEnsureAdminAccess(req, res),
}));

vi.mock("../../../../api/src/lib/database", () => ({
  reviewContributionInDB: (...args: unknown[]) =>
    mockReviewContributionInDB(...args),
}));

import handler from "../../../../api/src/pages/api/v1/admin/contributors/submissions/[id]/review";

describe("/api/v1/admin/contributors/submissions/[id]/review handler", () => {
  const validContributionId = "507f1f77bcf86cd799439011";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 405 Method Not Allowed for unsupported HTTP methods (e.g. GET/POST)", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { id: validContributionId },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getJSONData()).toEqual({
      status: false,
      message: "Method GET Not Allowed",
    });
  });

  it("halts execution when admin access is unauthorized (401/403)", async () => {
    mockEnsureAdminAccess.mockImplementation(
      (_req: NextApiRequest, res: NextApiResponse) => {
        res.status(401).json({ status: false, message: "Unauthorized" });
        return false;
      },
    );

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      query: { id: validContributionId },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockReviewContributionInDB).not.toHaveBeenCalled();
  });

  it("returns 400 when contribution ID is missing", async () => {
    mockEnsureAdminAccess.mockResolvedValue(true);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({
      status: false,
      message: "Contribution ID is required",
    });
  });

  it("returns 400 when action is not 'approve' or 'reject'", async () => {
    mockEnsureAdminAccess.mockResolvedValue(true);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      query: { id: validContributionId },
      body: { action: "invalid-action" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({
      status: false,
      message: "Action must be either 'approve' or 'reject'",
    });
  });

  it("returns 400 when awardedXp is invalid (negative, non-integer, > 500, or non-number)", async () => {
    mockEnsureAdminAccess.mockResolvedValue(true);

    const testCases = [-10, 501, 25.5, "100"];

    for (const invalidXp of testCases) {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PATCH",
        query: { id: validContributionId },
        body: { action: "approve", awardedXp: invalidXp },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData().message).toContain("awardedXp must be an integer between 0 and 500");
    }
  });

  it("returns 400 when rejecting without feedback note", async () => {
    mockEnsureAdminAccess.mockResolvedValue(true);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      query: { id: validContributionId },
      body: { action: "reject", feedback: "   " },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toContain("Rejection feedback note is required");
  });

  it("returns 404 when submission is not found", async () => {
    mockEnsureAdminAccess.mockResolvedValue(true);
    mockReviewContributionInDB.mockResolvedValueOnce({
      error: "Contribution submission not found",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      query: { id: validContributionId },
      body: { action: "approve" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData()).toEqual({
      status: false,
      message: "Contribution submission not found",
    });
  });

  it("returns 400 when submission is already reviewed or has a concurrent review conflict", async () => {
    mockEnsureAdminAccess.mockResolvedValue(true);
    mockReviewContributionInDB.mockResolvedValueOnce({
      error: "Contribution has already been reviewed (current status: approved)",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      query: { id: validContributionId },
      body: { action: "approve" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toContain("already been reviewed");
  });

  it("returns 500 when database/transactional failure occurs", async () => {
    mockEnsureAdminAccess.mockResolvedValue(true);
    mockReviewContributionInDB.mockResolvedValueOnce({
      error: "Failed to review contribution submission",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      query: { id: validContributionId },
      body: { action: "approve" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({
      status: false,
      message: "Failed to review contribution submission",
    });
  });

  it("successfully approves contribution with default XP when awardedXp is omitted", async () => {
    mockEnsureAdminAccess.mockResolvedValue(true);
    const mockReviewedDoc = {
      _id: validContributionId,
      status: "approved",
      awardedXp: 50,
    };
    mockReviewContributionInDB.mockResolvedValueOnce({
      data: mockReviewedDoc,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      query: { id: validContributionId },
      body: { action: "approve" },
    });

    await handler(req, res);

    expect(mockReviewContributionInDB).toHaveBeenCalledWith({
      contributionId: validContributionId,
      adminEmail: "admin@theboringeducation.com",
      action: "approve",
      awardedXp: undefined,
      feedback: undefined,
    });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      status: true,
      message: "Contribution approved successfully",
      data: mockReviewedDoc,
    });
  });

  it("successfully approves contribution with custom XP and adminEmail from request context", async () => {
    mockEnsureAdminAccess.mockResolvedValue(true);
    const mockReviewedDoc = {
      _id: validContributionId,
      status: "approved",
      awardedXp: 75,
    };
    mockReviewContributionInDB.mockResolvedValueOnce({
      data: mockReviewedDoc,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      query: { id: validContributionId },
      body: { action: "approve", awardedXp: 75, feedback: "Awesome PR!" },
    });
    (req as any).adminUser = { email: "reviewer@theboringeducation.com" };

    await handler(req, res);

    expect(mockReviewContributionInDB).toHaveBeenCalledWith({
      contributionId: validContributionId,
      adminEmail: "reviewer@theboringeducation.com",
      action: "approve",
      awardedXp: 75,
      feedback: "Awesome PR!",
    });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().data).toEqual(mockReviewedDoc);
  });

  it("successfully rejects contribution with feedback note", async () => {
    mockEnsureAdminAccess.mockResolvedValue(true);
    const mockReviewedDoc = {
      _id: validContributionId,
      status: "rejected",
      awardedXp: 0,
      adminFeedback: "Proof link is broken.",
    };
    mockReviewContributionInDB.mockResolvedValueOnce({
      data: mockReviewedDoc,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      query: { id: validContributionId },
      body: { action: "reject", feedback: "Proof link is broken." },
    });

    await handler(req, res);

    expect(mockReviewContributionInDB).toHaveBeenCalledWith({
      contributionId: validContributionId,
      adminEmail: "admin@theboringeducation.com",
      action: "reject",
      awardedXp: undefined,
      feedback: "Proof link is broken.",
    });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      status: true,
      message: "Contribution rejected",
      data: mockReviewedDoc,
    });
  });
});
