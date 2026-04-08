import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAddDSAQuestion = vi.fn();
const mockGetAllDSAQuestions = vi.fn();
const mockGetDSASheetMetadata = vi.fn();

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (handler: any) => handler,
}));

const mockGetDSATopicSummaries = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  addDSAQuestionToDB: (...args: any[]) => mockAddDSAQuestion(...args),
  getAllDSAQuestionsFromDB: (...args: any[]) => mockGetAllDSAQuestions(...args),
  getDSASheetMetadataFromDB: (...args: any[]) =>
    mockGetDSASheetMetadata(...args),
  getDSATopicSummariesFromDB: (...args: any[]) =>
    mockGetDSATopicSummaries(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (data: any) => data,
}));

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    RESOURCE_CREATED: 201,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
  },
  PAGINATION_LIMITS: {
    DEFAULT: 50,
  },
}));

import handler from "../../../../api/src/pages/api/v1/interview-prep/dsa-sheet/index";

describe("DSA Sheet API — /api/v1/interview-prep/dsa-sheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── POST: create DSA question ───────────────────────────────────────────────

  describe("POST — create question", () => {
    const validBody = {
      title: "Two Sum",
      answer: "Use a hash map to find complement in O(n)",
      domain: "dsa",
      difficulty: "easy",
      companyTypes: "product",
      topics: "arrays",
    };

    it("should create a question with answer field", async () => {
      const created = { _id: "q1", ...validBody };
      mockAddDSAQuestion.mockResolvedValue({ data: created });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: validBody,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(mockAddDSAQuestion).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Two Sum",
          answer: validBody.answer,
        }),
      );
    });

    it("should accept content field as backward-compatible alias for answer", async () => {
      const bodyWithContent = {
        title: "Reverse LL",
        content: "Iterate with prev/curr pointers",
        domain: "dsa",
        difficulty: "medium",
        companyTypes: "product",
        topics: "linked-list",
      };
      mockAddDSAQuestion.mockResolvedValue({ data: { _id: "q2" } });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: bodyWithContent,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(mockAddDSAQuestion).toHaveBeenCalledWith(
        expect.objectContaining({
          answer: "Iterate with prev/curr pointers",
        }),
      );
    });

    it("should prefer answer over content when both are provided", async () => {
      mockAddDSAQuestion.mockResolvedValue({ data: { _id: "q3" } });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          ...validBody,
          answer: "Correct answer",
          content: "Legacy content",
        },
      });

      await handler(req, res);

      expect(mockAddDSAQuestion).toHaveBeenCalledWith(
        expect.objectContaining({ answer: "Correct answer" }),
      );
    });

    it("should return 400 when required fields are missing", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: { title: "Incomplete" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const body = JSON.parse(res._getData());
      expect(body.message).toContain("Required");
    });

    it("should return 400 when answer/content is missing", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          title: "No answer",
          domain: "dsa",
          difficulty: "easy",
          companyTypes: "product",
          topics: "arrays",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("should wrap single-value domain into an array", async () => {
      mockAddDSAQuestion.mockResolvedValue({ data: { _id: "q4" } });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: validBody,
      });

      await handler(req, res);

      const call = mockAddDSAQuestion.mock.calls[0][0];
      expect(Array.isArray(call.domain)).toBe(true);
      expect(call.domain).toEqual(["dsa"]);
    });

    it("should pass array domain as-is", async () => {
      mockAddDSAQuestion.mockResolvedValue({ data: { _id: "q5" } });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: { ...validBody, domain: ["dsa", "frontend"] },
      });

      await handler(req, res);

      const call = mockAddDSAQuestion.mock.calls[0][0];
      expect(call.domain).toEqual(["dsa", "frontend"]);
    });

    it("should return 500 when DB insert fails", async () => {
      mockAddDSAQuestion.mockResolvedValue({
        data: null,
        error: "Duplicate key",
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: validBody,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });
  });

  // ── GET: list questions ─────────────────────────────────────────────────────

  describe("GET — list questions", () => {
    it("should return paginated questions", async () => {
      const questions = [{ _id: "q1", title: "Two Sum" }];
      mockGetAllDSAQuestions.mockResolvedValue({
        data: { questions, total: 1 },
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockGetAllDSAQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 50 }),
      );
    });

    it("should pass filters to the DB query", async () => {
      mockGetAllDSAQuestions.mockResolvedValue({ data: { questions: [] } });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {
          domain: "frontend",
          difficulty: "hard",
          topic: "trees",
          page: "2",
          limit: "10",
        },
      });

      await handler(req, res);

      expect(mockGetAllDSAQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: ["frontend"],
          difficulty: ["hard"],
          companyTypes: undefined,
          topics: ["trees"],
          page: 2,
          limit: 10,
        }),
      );
    });

    it("should pass through client limit without an artificial cap", async () => {
      mockGetAllDSAQuestions.mockResolvedValue({ data: { questions: [] } });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { limit: "5000" },
      });

      await handler(req, res);

      expect(mockGetAllDSAQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 5000 }),
      );
    });

    it("should omit limit for topic-scoped fetch so DB returns all matching rows", async () => {
      mockGetAllDSAQuestions.mockResolvedValue({ data: { questions: [] } });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { topic: "ARRAY" },
      });

      await handler(req, res);

      expect(mockGetAllDSAQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          topics: ["ARRAY"],
          limit: undefined,
        }),
      );
    });

    it("should return metadata when metadata=true", async () => {
      const metadata = {
        totalQuestions: 120,
        domains: ["dsa", "frontend"],
      };
      mockGetDSASheetMetadata.mockResolvedValue({ data: metadata });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { metadata: "true" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockGetDSASheetMetadata).toHaveBeenCalled();
      expect(mockGetAllDSAQuestions).not.toHaveBeenCalled();
    });

    it("should return 500 when GET DB query fails", async () => {
      mockGetAllDSAQuestions.mockResolvedValue({
        data: null,
        error: "Timeout",
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });
  });

  // ── Method guard ────────────────────────────────────────────────────────────

  it("should return 400 for unsupported methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "DELETE",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const body = JSON.parse(res._getData());
    expect(body.message).toContain("Not Allowed");
  });
});
