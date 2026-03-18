import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockExportDSAQuestions = vi.fn();
const mockExportInterviewSheets = vi.fn();
const mockExportAptitudeTopics = vi.fn();
const mockExportQuizzes = vi.fn();

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (handler: any) => handler,
}));

vi.mock("../../../../api/src/lib/database", () => ({
  exportDSAQuestionsFromDB: (...args: any[]) => mockExportDSAQuestions(...args),
  exportInterviewSheetsFromDB: (...args: any[]) =>
    mockExportInterviewSheets(...args),
  exportAptitudeTopicsFromDB: (...args: any[]) =>
    mockExportAptitudeTopics(...args),
  exportQuizzesFromDB: (...args: any[]) => mockExportQuizzes(...args),
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

import handler from "../../../../api/src/pages/api/v1/content/export";

describe("Content Export API — GET /api/v1/content/export", () => {
  const ADMIN_SECRET = "test-admin-secret-xyz";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_SECRET = ADMIN_SECRET;
  });

  afterEach(() => {
    delete process.env.ADMIN_SECRET;
  });

  function mockRequest(
    query: Record<string, string> = {},
    headers: Record<string, string> = {},
    method = "GET",
  ) {
    return createMocks<NextApiRequest, NextApiResponse>({
      method: method as any,
      query,
      headers: { "x-admin-secret": ADMIN_SECRET, ...headers },
    });
  }

  // ── Auth ────────────────────────────────────────────────────────────────────

  it("should reject requests without admin secret", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { type: "dsa-questions" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Unauthorized");
  });

  it("should reject requests with wrong admin secret", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { type: "dsa-questions" },
      headers: { "x-admin-secret": "wrong-secret" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  // ── Method ──────────────────────────────────────────────────────────────────

  it("should reject non-GET methods", async () => {
    const { req, res } = mockRequest({ type: "all" }, {}, "POST");

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Not Allowed");
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  it("should return 400 when type param is missing", async () => {
    const { req, res } = mockRequest({});

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("type");
  });

  // ── DSA Questions ───────────────────────────────────────────────────────────

  it("should export DSA questions", async () => {
    const questions = [
      { _id: "q1", title: "Two Sum", answer: "Use a hash map" },
    ];
    mockExportDSAQuestions.mockResolvedValue({
      data: { questions, count: 1 },
    });

    const { req, res } = mockRequest({ type: "dsa-questions" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockExportDSAQuestions).toHaveBeenCalledWith({
      topics: undefined,
      domain: undefined,
      difficulty: undefined,
    });
    const body = JSON.parse(res._getData());
    expect(body.data.dsaQuestions.count).toBe(1);
  });

  it("should pass DSA filters (topics, domain, difficulty)", async () => {
    mockExportDSAQuestions.mockResolvedValue({
      data: { questions: [], count: 0 },
    });

    const { req, res } = mockRequest({
      type: "dsa-questions",
      topics: "arrays,strings",
      domain: "frontend",
      difficulty: "easy,medium",
    });

    await handler(req, res);

    expect(mockExportDSAQuestions).toHaveBeenCalledWith({
      topics: ["arrays", "strings"],
      domain: ["frontend"],
      difficulty: ["easy", "medium"],
    });
  });

  // ── Interview Sheets ────────────────────────────────────────────────────────

  it("should export interview sheets", async () => {
    mockExportInterviewSheets.mockResolvedValue({
      data: { sheets: [{ slug: "js-prep" }], count: 1 },
    });

    const { req, res } = mockRequest({ type: "interview-sheets" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockExportInterviewSheets).toHaveBeenCalled();
    const body = JSON.parse(res._getData());
    expect(body.data.interviewSheets.count).toBe(1);
  });

  // ── Aptitude ────────────────────────────────────────────────────────────────

  it("should export aptitude topics", async () => {
    mockExportAptitudeTopics.mockResolvedValue({
      data: { topics: [{ topic: "percentages" }], count: 1 },
    });

    const { req, res } = mockRequest({ type: "aptitude" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockExportAptitudeTopics).toHaveBeenCalled();
    const body = JSON.parse(res._getData());
    expect(body.data.aptitude.count).toBe(1);
  });

  // ── Quizzes ─────────────────────────────────────────────────────────────────

  it("should export quizzes", async () => {
    mockExportQuizzes.mockResolvedValue({
      data: { quizzes: [{ categoryName: "JavaScript" }], count: 1 },
    });

    const { req, res } = mockRequest({ type: "quizzes" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData());
    expect(body.data.quizzes.count).toBe(1);
  });

  // ── Export All ──────────────────────────────────────────────────────────────

  it("should export all content types when type=all", async () => {
    mockExportDSAQuestions.mockResolvedValue({
      data: { questions: [], count: 0 },
    });
    mockExportInterviewSheets.mockResolvedValue({
      data: { sheets: [], count: 0 },
    });
    mockExportAptitudeTopics.mockResolvedValue({
      data: { topics: [], count: 0 },
    });
    mockExportQuizzes.mockResolvedValue({
      data: { quizzes: [], count: 0 },
    });

    const { req, res } = mockRequest({ type: "all" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockExportDSAQuestions).toHaveBeenCalled();
    expect(mockExportInterviewSheets).toHaveBeenCalled();
    expect(mockExportAptitudeTopics).toHaveBeenCalled();
    expect(mockExportQuizzes).toHaveBeenCalled();

    const body = JSON.parse(res._getData());
    expect(body.data).toHaveProperty("dsaQuestions");
    expect(body.data).toHaveProperty("interviewSheets");
    expect(body.data).toHaveProperty("aptitude");
    expect(body.data).toHaveProperty("quizzes");
  });

  // ── Errors ──────────────────────────────────────────────────────────────────

  it("should return 500 when a DB export function errors", async () => {
    mockExportDSAQuestions.mockResolvedValue({
      data: null,
      error: "Connection refused",
    });

    const { req, res } = mockRequest({ type: "dsa-questions" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const body = JSON.parse(res._getData());
    expect(body.status).toBe(false);
  });

  it("should return 500 when an unexpected exception is thrown", async () => {
    mockExportDSAQuestions.mockRejectedValue(new Error("Unexpected crash"));

    const { req, res } = mockRequest({ type: "dsa-questions" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const body = JSON.parse(res._getData());
    expect(body.message).toBe("Export failed");
  });
});
