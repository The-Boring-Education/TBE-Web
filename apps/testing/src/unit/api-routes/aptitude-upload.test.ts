import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockBulkUploadAptitude = vi.fn();

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (handler: any) => handler,
}));

vi.mock("../../../../api/src/lib/database", () => ({
  bulkUploadAptitudeDataToDB: (...args: any[]) =>
    mockBulkUploadAptitude(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (data: any) => data,
}));

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    METHOD_NOT_ALLOWED: 405,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

vi.mock("../../../../api/src/lib/interfaces", () => ({}));

import handler from "../../../../api/src/pages/api/v1/interview-prep/aptitude/upload";

describe("Aptitude Upload API — POST /api/v1/interview-prep/aptitude/upload", () => {
  const ADMIN_SECRET = "test-admin-secret-xyz";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_SECRET = ADMIN_SECRET;
  });

  afterEach(() => {
    delete process.env.ADMIN_SECRET;
  });

  function mockRequest(body: any = {}, method = "POST") {
    return createMocks<NextApiRequest, NextApiResponse>({
      method: method as any,
      body,
      headers: { "x-admin-secret": ADMIN_SECRET },
    });
  }

  // ── Auth ────────────────────────────────────────────────────────────────────

  it("should reject requests without admin secret", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { topic: "percentages", questions: [{}] },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const body = JSON.parse(res._getData());
    expect(body.message).toBe("Unauthorized");
  });

  it("should reject requests with wrong admin secret", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { topic: "percentages", questions: [{}] },
      headers: { "x-admin-secret": "wrong" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  // ── Method ──────────────────────────────────────────────────────────────────

  it("should reject non-POST methods", async () => {
    const { req, res } = mockRequest({}, "GET");

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const body = JSON.parse(res._getData());
    expect(body.message).toContain("Not Allowed");
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  it("should return 400 when topic is missing", async () => {
    const { req, res } = mockRequest({
      questions: [{ question: "What is 10%?", answer: "0.1" }],
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const body = JSON.parse(res._getData());
    expect(body.message).toContain("topic");
  });

  it("should return 400 when questions is missing", async () => {
    const { req, res } = mockRequest({ topic: "percentages" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const body = JSON.parse(res._getData());
    expect(body.message).toContain("questions");
  });

  it("should return 400 when questions is an empty array", async () => {
    const { req, res } = mockRequest({
      topic: "percentages",
      questions: [],
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("should return 400 when questions is not an array", async () => {
    const { req, res } = mockRequest({
      topic: "percentages",
      questions: "not-an-array",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  // ── Successful upload ───────────────────────────────────────────────────────

  it("should upload questions and return merge statistics", async () => {
    mockBulkUploadAptitude.mockResolvedValue({
      data: {
        topic: "percentages",
        questionsAdded: 3,
        questionsUpdated: 2,
        totalQuestions: 15,
      },
    });

    const questions = [
      { question: "Q1", answer: "A1", difficulty: "easy" },
      { question: "Q2", answer: "A2", difficulty: "medium" },
      { question: "Q3", answer: "A3", difficulty: "hard" },
    ];

    const { req, res } = mockRequest({ topic: "percentages", questions });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockBulkUploadAptitude).toHaveBeenCalledWith({
      topic: "percentages",
      questions,
    });

    const body = JSON.parse(res._getData());
    expect(body.status).toBe(true);
    expect(body.message).toContain("3 added");
    expect(body.message).toContain("2 updated");
    expect(body.message).toContain("15 total");
    expect(body.data.questionsAdded).toBe(3);
    expect(body.data.questionsUpdated).toBe(2);
    expect(body.data.totalQuestions).toBe(15);
  });

  // ── DB error ────────────────────────────────────────────────────────────────

  it("should return 500 when DB upload fails", async () => {
    mockBulkUploadAptitude.mockResolvedValue({
      data: null,
      error: "Invalid topic slug: fake-topic",
      details: "Validation failed",
    });

    const { req, res } = mockRequest({
      topic: "fake-topic",
      questions: [{ question: "Q", answer: "A" }],
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const body = JSON.parse(res._getData());
    expect(body.message).toBe("Bulk upload failed");
    expect(body.error).toContain("Invalid topic slug");
  });
});
