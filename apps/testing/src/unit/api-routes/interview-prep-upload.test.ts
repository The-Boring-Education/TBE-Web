import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockAddSheet = vi.fn();
const mockAppendQuestions = vi.fn();

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (handler: unknown) => handler,
}));

vi.mock("../../../../api/src/lib/database", () => ({
  addAInterviewSheetToDB: (...args: unknown[]) => mockAddSheet(...args),
  appendQuestionsToInterviewSheetInDB: (...args: unknown[]) =>
    mockAppendQuestions(...args),
}));

vi.mock("../../../../api/src/lib/utils/functions", () => ({
  sendAPIResponse: (data: Record<string, unknown>) => data,
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import handler from "../../../../api/src/pages/api/v1/interview-prep/upload";

describe("Interview Prep Upload API — POST /api/v1/interview-prep/upload", () => {
  const validSheetId = "507f1f77bcf86cd799439011";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const baseSessionBody = {
    sessionId: "session-1",
    sheetData: {
      name: "React",
      slug: "react",
      description: "desc",
      meta: "meta",
      coverImageURL: "https://example.com/cover",
      roadmap: "Tech",
      isPremium: false,
      price: 0,
      discountPercentage: 0,
      appliedCoupon: null,
      features: [],
      questions: [
        {
          title: "Q1",
          question: "What is React?",
          answer: "A library",
          frequency: "Most Asked",
          priority: "High",
        },
      ],
    },
  };

  it("returns 400 when sessionId is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { sheetData: baseSessionBody.sheetData },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(mockAddSheet).not.toHaveBeenCalled();
    expect(mockAppendQuestions).not.toHaveBeenCalled();
  });

  it("appends questions when sheetId is provided", async () => {
    mockAppendQuestions.mockResolvedValueOnce({
      data: {
        _id: validSheetId,
        questions: baseSessionBody.sheetData.questions,
      },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        ...baseSessionBody,
        sheetId: validSheetId,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData() as string);
    expect(body.success).toBe(true);
    expect(body.message).toContain("Successfully appended");
    expect(mockAppendQuestions).toHaveBeenCalledWith(
      validSheetId,
      baseSessionBody.sheetData.questions,
    );
    expect(mockAddSheet).not.toHaveBeenCalled();
  });

  it("returns 400 when sheetId is set but questions array is empty", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        sessionId: "session-1",
        sheetId: validSheetId,
        sheetData: { questions: [] },
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const body = JSON.parse(res._getData() as string);
    expect(body.message).toContain("non-empty questions");
    expect(mockAppendQuestions).not.toHaveBeenCalled();
  });

  it("creates new sheet when sheetId is omitted", async () => {
    mockAddSheet.mockResolvedValueOnce({
      data: { _id: "new-sheet", ...baseSessionBody.sheetData },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: baseSessionBody,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData() as string);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Imported successfully");
    expect(mockAddSheet).toHaveBeenCalled();
    expect(mockAppendQuestions).not.toHaveBeenCalled();
  });

  it("returns 405 for non-POST", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
