import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockSyncDSAQuestions = vi.fn();
const mockSyncInterviewSheets = vi.fn();
const mockSyncQuizzes = vi.fn();
const mockBulkUploadAptitude = vi.fn();

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (handler: any) => handler,
}));

vi.mock("../../../../api/src/lib/database", () => ({
  syncDSAQuestionsToDB: (...args: any[]) => mockSyncDSAQuestions(...args),
  syncInterviewSheetsToDB: (...args: any[]) => mockSyncInterviewSheets(...args),
  syncQuizzesToDB: (...args: any[]) => mockSyncQuizzes(...args),
  bulkUploadAptitudeDataToDB: (...args: any[]) =>
    mockBulkUploadAptitude(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (data: any) => data,
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
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

import handler from "../../../../api/src/pages/api/v1/content/sync";

describe("Content Sync API — POST /api/v1/content/sync", () => {
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

  function mockRequestNoAuth(body: any = {}) {
    return createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body,
    });
  }

  // ── Auth ────────────────────────────────────────────────────────────────────

  it("should reject requests without admin secret", async () => {
    const { req, res } = mockRequestNoAuth({
      type: "dsa-questions",
      data: { questions: [] },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  it("should reject requests with wrong admin secret", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { type: "dsa-questions", data: { questions: [] } },
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
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  it("should return 400 when type is missing", async () => {
    const { req, res } = mockRequest({ data: { questions: [] } });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const body = JSON.parse(res._getData());
    expect(body.message).toContain("type");
  });

  it("should return 400 when data is missing", async () => {
    const { req, res } = mockRequest({ type: "dsa-questions" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("should return 400 for invalid type", async () => {
    const { req, res } = mockRequest({
      type: "invalid-type",
      data: { something: [] },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const body = JSON.parse(res._getData());
    expect(body.message).toContain("Invalid type");
  });

  // ── Empty arrays ────────────────────────────────────────────────────────────

  it("should return 400 when dsa-questions data.questions is empty", async () => {
    const { req, res } = mockRequest({
      type: "dsa-questions",
      data: { questions: [] },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const body = JSON.parse(res._getData());
    expect(body.message).toContain("questions");
  });

  it("should return 400 when interview-sheets data.sheets is empty", async () => {
    const { req, res } = mockRequest({
      type: "interview-sheets",
      data: { sheets: [] },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("should return 400 when aptitude data.topics is empty", async () => {
    const { req, res } = mockRequest({
      type: "aptitude",
      data: { topics: [] },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("should return 400 when quizzes data.quizzes is empty", async () => {
    const { req, res } = mockRequest({
      type: "quizzes",
      data: { quizzes: [] },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  // ── Successful syncs ───────────────────────────────────────────────────────

  it("should sync DSA questions successfully", async () => {
    mockSyncDSAQuestions.mockResolvedValue({
      data: { added: 2, updated: 1, failed: 0, total: 3, errors: [] },
    });

    const { req, res } = mockRequest({
      type: "dsa-questions",
      data: {
        questions: [
          { title: "Two Sum", answer: "hash map", domain: ["dsa"] },
          { title: "Binary Search", answer: "divide", domain: ["dsa"] },
          { title: "Existing Q", answer: "updated", domain: ["dsa"] },
        ],
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockSyncDSAQuestions).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ title: "Two Sum" })]),
    );
    const body = JSON.parse(res._getData());
    expect(body.data.added).toBe(2);
    expect(body.data.updated).toBe(1);
    expect(body.message).toContain("dsa-questions");
  });

  it("should sync interview sheets successfully", async () => {
    mockSyncInterviewSheets.mockResolvedValue({
      data: { added: 1, updated: 0, failed: 0, total: 1, errors: [] },
    });

    const { req, res } = mockRequest({
      type: "interview-sheets",
      data: { sheets: [{ slug: "js-prep", name: "JS Prep" }] },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockSyncInterviewSheets).toHaveBeenCalled();
  });

  it("should sync aptitude topics by iterating each topic", async () => {
    mockBulkUploadAptitude
      .mockResolvedValueOnce({
        data: {
          topic: "percentages",
          questionsAdded: 5,
          questionsUpdated: 0,
          totalQuestions: 5,
        },
      })
      .mockResolvedValueOnce({
        data: {
          topic: "profit-loss",
          questionsAdded: 3,
          questionsUpdated: 2,
          totalQuestions: 10,
        },
      });

    const { req, res } = mockRequest({
      type: "aptitude",
      data: {
        topics: [
          { topic: "percentages", questions: [{}, {}, {}, {}, {}] },
          { topic: "profit-loss", questions: [{}, {}, {}] },
        ],
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockBulkUploadAptitude).toHaveBeenCalledTimes(2);
    const body = JSON.parse(res._getData());
    expect(body.data.topics).toHaveLength(2);
    expect(body.data.topics[0].questionsAdded).toBe(5);
    expect(body.data.topics[1].questionsUpdated).toBe(2);
  });

  it("should handle partial aptitude topic errors gracefully", async () => {
    mockBulkUploadAptitude
      .mockResolvedValueOnce({
        data: { topic: "ok-topic", questionsAdded: 1 },
      })
      .mockResolvedValueOnce({
        error: "Invalid topic slug",
      });

    const { req, res } = mockRequest({
      type: "aptitude",
      data: {
        topics: [
          { topic: "ok-topic", questions: [{}] },
          { topic: "bad-topic", questions: [{}] },
        ],
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData());
    expect(body.data.topics[1].error).toBe("Invalid topic slug");
  });

  it("should sync quizzes successfully", async () => {
    mockSyncQuizzes.mockResolvedValue({
      data: { added: 1, updated: 1, failed: 0, total: 2, errors: [] },
    });

    const { req, res } = mockRequest({
      type: "quizzes",
      data: {
        quizzes: [
          { categoryName: "JavaScript", questions: [] },
          { categoryName: "React", questions: [] },
        ],
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockSyncQuizzes).toHaveBeenCalled();
  });

  // ── DB errors ───────────────────────────────────────────────────────────────

  it("should return 500 when sync DB function returns error", async () => {
    mockSyncDSAQuestions.mockResolvedValue({
      data: null,
      error: "DB write failed",
    });

    const { req, res } = mockRequest({
      type: "dsa-questions",
      data: { questions: [{ title: "Q1" }] },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });

  it("should return 500 when an unexpected exception is thrown", async () => {
    mockSyncDSAQuestions.mockRejectedValue(new Error("Connection lost"));

    const { req, res } = mockRequest({
      type: "dsa-questions",
      data: { questions: [{ title: "Q1" }] },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const body = JSON.parse(res._getData());
    expect(body.message).toBe("Sync failed");
  });

  // ── Dry run ─────────────────────────────────────────────────────────────────

  it("should handle dry run for dsa-questions", async () => {
    const { req, res } = mockRequest({
      type: "dsa-questions",
      dryRun: true,
      data: {
        questions: [{ title: "Two Sum" }, { title: "Binary Search" }],
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockSyncDSAQuestions).not.toHaveBeenCalled();
    const body = JSON.parse(res._getData());
    expect(body.data.dryRun).toBe(true);
    expect(body.data.questionsToSync).toBe(2);
    expect(body.data.sampleTitles).toEqual(["Two Sum", "Binary Search"]);
  });

  it("should handle dry run for interview-sheets", async () => {
    const { req, res } = mockRequest({
      type: "interview-sheets",
      dryRun: true,
      data: { sheets: [{ slug: "js-prep" }] },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockSyncInterviewSheets).not.toHaveBeenCalled();
    const body = JSON.parse(res._getData());
    expect(body.data.sheetsToSync).toBe(1);
    expect(body.data.sampleSlugs).toEqual(["js-prep"]);
  });

  it("should handle dry run for aptitude", async () => {
    const { req, res } = mockRequest({
      type: "aptitude",
      dryRun: true,
      data: {
        topics: [{ topic: "percentages", questions: [{}, {}, {}] }],
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockBulkUploadAptitude).not.toHaveBeenCalled();
    const body = JSON.parse(res._getData());
    expect(body.data.topicsToSync).toBe(1);
    expect(body.data.topicDetails[0].questionCount).toBe(3);
  });

  it("should handle dry run for quizzes", async () => {
    const { req, res } = mockRequest({
      type: "quizzes",
      dryRun: true,
      data: { quizzes: [{ categoryName: "JS" }] },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData());
    expect(body.data.quizzesToSync).toBe(1);
    expect(body.data.sampleCategories).toEqual(["JS"]);
  });

  it("should return 400 for dry run with invalid type", async () => {
    const { req, res } = mockRequest({
      type: "invalid",
      dryRun: true,
      data: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("should cap dry run sample titles at 5", async () => {
    const questions = Array.from({ length: 10 }, (_, i) => ({
      title: `Question ${i + 1}`,
    }));

    const { req, res } = mockRequest({
      type: "dsa-questions",
      dryRun: true,
      data: { questions },
    });

    await handler(req, res);

    const body = JSON.parse(res._getData());
    expect(body.data.questionsToSync).toBe(10);
    expect(body.data.sampleTitles).toHaveLength(5);
  });
});
