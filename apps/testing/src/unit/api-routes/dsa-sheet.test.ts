import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAddDSAQuestion = vi.fn();
const mockGetAllDSAQuestions = vi.fn();
const mockGetDSASheetMetadata = vi.fn();
const mockGetDSATopicSummaries = vi.fn();
const mockCheckPaymentStatus = vi.fn();
const mockTrackPersonalizationInvalidInput = vi.fn();
const mockTrackPersonalizationNormalizationFallback = vi.fn();

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (handler: any) => handler,
}));

vi.mock("../../../../api/src/lib/database", () => ({
  addDSAQuestionToDB: (...args: any[]) => mockAddDSAQuestion(...args),
  getAllDSAQuestionsFromDB: (...args: any[]) => mockGetAllDSAQuestions(...args),
  getDSASheetMetadataFromDB: (...args: any[]) =>
    mockGetDSASheetMetadata(...args),
  getDSATopicSummariesFromDB: (...args: any[]) =>
    mockGetDSATopicSummaries(...args),
  checkPaymentStatusFromDB: (...args: any[]) => mockCheckPaymentStatus(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (data: any) => data,
  trackPersonalizationInvalidInput: (...args: any[]) =>
    mockTrackPersonalizationInvalidInput(...args),
  trackPersonalizationNormalizationFallback: (...args: any[]) =>
    mockTrackPersonalizationNormalizationFallback(...args),
}));

vi.mock("../../../../api/src/lib/constants", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../api/src/lib/constants")>();
  return {
    ...actual,
    apiStatusCodes: {
      OKAY: 200,
      RESOURCE_CREATED: 201,
      BAD_REQUEST: 400,
      INTERNAL_SERVER_ERROR: 500,
    },
    PAGINATION_LIMITS: {
      DEFAULT: 50,
    },
  };
});

import handler from "../../../../api/src/pages/api/v1/interview-prep/dsa-sheet/index";

describe("DSA Sheet API — /api/v1/interview-prep/dsa-sheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── POST: create DSA question ───────────────────────────────────────────────

  describe("POST — create question", () => {
    /** Matches `dsaQuestionCreateSchema` (COMPANY_TYPES / DSA_TOPICS enums). */
    const validBody = {
      title: "Two Sum",
      answer: "Use a hash map to find complement in O(n)",
      domain: "DSA",
      difficulty: "easy",
      companyTypes: "Startup",
      topics: "ARRAY",
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
        domain: "DSA",
        difficulty: "medium",
        companyTypes: "MNC",
        topics: "LINKED_LIST",
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
          domain: "DSA",
          difficulty: "easy",
          companyTypes: "Startup",
          topics: "ARRAY",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
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
          difficulty: "hard",
          topic: "binary_tree",
          page: "2",
          limit: "10",
        },
      });

      await handler(req, res);

      expect(mockGetAllDSAQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: ["HARD"],
          topics: ["BINARY_TREE"],
          page: 2,
          limit: 10,
          offCampus: false,
        }),
      );
      expect(mockGetAllDSAQuestions.mock.calls[0][0]).not.toHaveProperty(
        "companyTypes",
      );
    });

    it("should normalize companyType aliases before DB query", async () => {
      mockGetAllDSAQuestions.mockResolvedValue({ data: { questions: [] } });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {
          companyType: "startup",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockGetAllDSAQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          companyTypes: ["Startup"],
        }),
      );
    });

    it("should cap list limit at DSA_SHEET_MAX_LIMIT (200)", async () => {
      mockGetAllDSAQuestions.mockResolvedValue({ data: { questions: [] } });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { limit: "5000" },
      });

      await handler(req, res);

      expect(mockGetAllDSAQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 200 }),
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

  // ── Payment / freemium gating ───────────────────────────────────────────────

  // Valid 24-char hex Mongo ObjectId string (validator rejects non-ObjectIds)
  const MOCK_USER_ID = "507f1f77bcf86cd799439011";

  describe("Payment gating (isPaidUser handoff)", () => {
    it("should NOT call checkPaymentStatusFromDB when userId is absent (isPaidUser=false)", async () => {
      mockGetAllDSAQuestions.mockResolvedValue({
        data: { questions: [], isFreemiumUser: true },
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await handler(req, res);

      expect(mockCheckPaymentStatus).not.toHaveBeenCalled();
      expect(mockGetAllDSAQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ isPaidUser: false }),
      );
    });

    it("should pass productId='lifetime' + productType='DSA_YATRA' to the payment check", async () => {
      mockCheckPaymentStatus.mockResolvedValue({
        data: { purchased: true, accessType: "DIRECT_PAYMENT" },
      });
      mockGetAllDSAQuestions.mockResolvedValue({ data: { questions: [] } });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: MOCK_USER_ID },
      });

      await handler(req, res);

      expect(mockCheckPaymentStatus).toHaveBeenCalledWith(
        MOCK_USER_ID,
        "lifetime",
        "DSA_YATRA",
      );
    });

    it("should pass ONCAMPUS productType to payment check when requested", async () => {
      mockCheckPaymentStatus.mockResolvedValue({ data: { purchased: true } });
      mockGetAllDSAQuestions.mockResolvedValue({ data: { questions: [] } });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {
          userId: MOCK_USER_ID,
          productType: "ONCAMPUS",
        },
      });

      await handler(req, res);

      expect(mockCheckPaymentStatus).toHaveBeenCalledWith(
        MOCK_USER_ID,
        "lifetime",
        "ONCAMPUS",
      );
      expect(mockGetAllDSAQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          productType: "ONCAMPUS",
        }),
      );
    });

    it("should mark isPaidUser=true when payment returned purchased=true", async () => {
      mockCheckPaymentStatus.mockResolvedValue({ data: { purchased: true } });
      mockGetAllDSAQuestions.mockResolvedValue({ data: { questions: [] } });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: MOCK_USER_ID },
      });

      await handler(req, res);

      expect(mockGetAllDSAQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ userId: MOCK_USER_ID, isPaidUser: true }),
      );
    });

    it("should mark isPaidUser=false when payment returned purchased=false (freemium)", async () => {
      mockCheckPaymentStatus.mockResolvedValue({
        data: { purchased: false },
        error: "No payment record found",
      });
      mockGetAllDSAQuestions.mockResolvedValue({
        data: { questions: [], isFreemiumUser: true },
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: MOCK_USER_ID },
      });

      await handler(req, res);

      expect(mockGetAllDSAQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ userId: MOCK_USER_ID, isPaidUser: false }),
      );
    });

    it("should mark isPaidUser=true for subscription-based access (SUBSCRIPTION)", async () => {
      // Mirrors Subscription short-circuit in checkPaymentStatusFromDB
      mockCheckPaymentStatus.mockResolvedValue({
        data: { purchased: true, accessType: "SUBSCRIPTION" },
      });
      mockGetAllDSAQuestions.mockResolvedValue({ data: { questions: [] } });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: MOCK_USER_ID },
      });

      await handler(req, res);

      expect(mockGetAllDSAQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ isPaidUser: true }),
      );
    });
  });

  // ── Duration bucketing params passthrough ───────────────────────────────────

  describe("Duration bucket parameters", () => {
    it("should forward duration + offCampus flags to the DB query", async () => {
      mockCheckPaymentStatus.mockResolvedValue({ data: { purchased: true } });
      mockGetAllDSAQuestions.mockResolvedValue({ data: { questions: [] } });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {
          userId: MOCK_USER_ID,
          duration: "3Months",
          offCampus: "true",
          topic: "ARRAY",
        },
      });

      await handler(req, res);

      expect(mockGetAllDSAQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: "3Months",
          offCampus: true,
          topics: ["ARRAY"],
          isPaidUser: true,
        }),
      );
    });

    it("should default offCampus=false when not provided", async () => {
      mockCheckPaymentStatus.mockResolvedValue({ data: { purchased: true } });
      mockGetAllDSAQuestions.mockResolvedValue({ data: { questions: [] } });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: MOCK_USER_ID, duration: "1Month" },
      });

      await handler(req, res);

      expect(mockGetAllDSAQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ duration: "1Month", offCampus: false }),
      );
    });

    it("should forward realWorld filter mode", async () => {
      mockCheckPaymentStatus.mockResolvedValue({ data: { purchased: true } });
      mockGetAllDSAQuestions.mockResolvedValue({ data: { questions: [] } });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: MOCK_USER_ID, realWorld: "only" },
      });

      await handler(req, res);

      expect(mockGetAllDSAQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ realWorld: "only" }),
      );
    });

    it("should reject unknown duration keys (validation guard)", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: MOCK_USER_ID, duration: "9Months" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(mockGetAllDSAQuestions).not.toHaveBeenCalled();
    });

    it("should accept legacy duration aliases and normalize them", async () => {
      mockCheckPaymentStatus.mockResolvedValue({ data: { purchased: true } });
      mockGetAllDSAQuestions.mockResolvedValue({ data: { questions: [] } });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {
          userId: MOCK_USER_ID,
          duration: "4-6 months",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockGetAllDSAQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ duration: "6Months" }),
      );
    });
  });

  // ── Topics summary query ────────────────────────────────────────────────────

  describe("topics summary query", () => {
    it("should call getDSATopicSummariesFromDB when query=topics", async () => {
      mockGetDSATopicSummaries.mockResolvedValue({
        data: [{ topic: "ARRAY", count: 42, completed: 5 }],
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { query: "topics", userId: MOCK_USER_ID },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockGetDSATopicSummaries).toHaveBeenCalledWith(
        MOCK_USER_ID,
        "DSA_YATRA",
        undefined,
        undefined,
        false,
        false,
      );
      expect(mockGetAllDSAQuestions).not.toHaveBeenCalled();
    });

    it("should pass OnCampus product context to topic summaries", async () => {
      mockGetDSATopicSummaries.mockResolvedValue({
        data: [{ topic: "ARRAY", count: 22, completed: 3 }],
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {
          query: "topics",
          userId: MOCK_USER_ID,
          productType: "ONCAMPUS",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockGetDSATopicSummaries).toHaveBeenCalledWith(
        MOCK_USER_ID,
        "ONCAMPUS",
        undefined,
        undefined,
        false,
        false,
      );
    });

    it("should apply duration-aware topics path when duration is provided", async () => {
      mockCheckPaymentStatus.mockResolvedValue({ data: { purchased: true } });
      mockGetDSATopicSummaries.mockResolvedValue({
        data: [{ topic: "ARRAY", count: 14, completed: 2 }],
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {
          query: "topics",
          userId: MOCK_USER_ID,
          duration: "6Months",
          offCampus: "true",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockCheckPaymentStatus).toHaveBeenCalledWith(
        MOCK_USER_ID,
        "lifetime",
        "DSA_YATRA",
      );
      expect(mockGetDSATopicSummaries).toHaveBeenCalledWith(
        MOCK_USER_ID,
        "DSA_YATRA",
        undefined,
        "6Months",
        true,
        true,
      );
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
