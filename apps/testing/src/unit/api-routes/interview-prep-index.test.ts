import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAddAInterviewSheetToDB = vi.fn();
const mockGetAllInterviewSheetsFromDB = vi.fn();
const mockGetAptitudeMetadataFromDB = vi.fn();
const mockGetAptitudeQuestionsByTopicFromDB = vi.fn();
const mockGetAptitudeTopicsWithQuestionCountFromDB = vi.fn();
const mockGetDSAQuestionsGroupedByTopic = vi.fn();
const mockGetDSASheetMetadataFromDB = vi.fn();
const mockGetInterviewSheetBySlugFromDB = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
  APTITUDE_CATEGORIES: ["QUANTITATIVE", "VERBAL", "REASONING", "INTERVIEW"],
  APTITUDE_SUB_CATEGORIES: [
    "ARITHMETIC_APTITUDE",
    "DATA_INTERPRETATION",
    "VERBAL_ABILITY",
    "LOGICAL_REASONING",
    "GD_ROUND",
    "HR_INTERVIEW",
  ],
  COMPANY_TYPES: ["Startup", "MidSize", "MNC", "FAANG"],
  DSA_DIFFICULTY: ["EASY", "MEDIUM", "HARD"],
  DSA_DOMAIN: ["FRONTEND", "BACKEND", "GENERAL", "FULLSTACK"],
  PAGINATION_LIMITS: {
    DEFAULT: 50,
  },
}));

vi.mock("../../../../api/src/lib/database", () => ({
  addAInterviewSheetToDB: (...args: unknown[]) =>
    mockAddAInterviewSheetToDB(...args),
  getAllInterviewSheetsFromDB: (...args: unknown[]) =>
    mockGetAllInterviewSheetsFromDB(...args),
  getAptitudeMetadataFromDB: (...args: unknown[]) =>
    mockGetAptitudeMetadataFromDB(...args),
  getAptitudeQuestionsByTopicFromDB: (...args: unknown[]) =>
    mockGetAptitudeQuestionsByTopicFromDB(...args),
  getAptitudeTopicsWithQuestionCountFromDB: (...args: unknown[]) =>
    mockGetAptitudeTopicsWithQuestionCountFromDB(...args),
  getDSAQuestionsGroupedByTopic: (...args: unknown[]) =>
    mockGetDSAQuestionsGroupedByTopic(...args),
  getDSASheetMetadataFromDB: (...args: unknown[]) =>
    mockGetDSASheetMetadataFromDB(...args),
  getInterviewSheetBySlugFromDB: (...args: unknown[]) =>
    mockGetInterviewSheetBySlugFromDB(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    request: vi.fn(),
  },
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (
    fn: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  ) => fn,
}));

import handler from "../../../../api/src/pages/api/v1/interview-prep";

describe("Interview Prep Index API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unsupported methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Not Allowed");
  });

  it("POST - sheet already exists → 400", async () => {
    mockGetInterviewSheetBySlugFromDB.mockResolvedValue({
      data: { _id: "1", slug: "existing" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { slug: "existing", title: "Sheet" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Sheet already exists");
    expect(mockAddAInterviewSheetToDB).not.toHaveBeenCalled();
  });

  it("POST - add sheet successfully → 200", async () => {
    mockGetInterviewSheetBySlugFromDB.mockResolvedValue({
      data: null,
      error: "Not found",
    });
    mockAddAInterviewSheetToDB.mockResolvedValue({
      data: { _id: "new-1", slug: "new-sheet" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { slug: "new-sheet", title: "New Sheet" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data.slug).toBe("new-sheet");
  });

  it("POST - add sheet error → 500", async () => {
    mockGetInterviewSheetBySlugFromDB.mockResolvedValue({
      data: null,
      error: "Not found",
    });
    mockAddAInterviewSheetToDB.mockResolvedValue({
      data: null,
      error: new Error("DB error"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { slug: "new-sheet", title: "New Sheet" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Sheet not added");
  });

  it("GET (no roadmap, no slug) - all sheets → 200", async () => {
    const allSheets = [
      { _id: "1", slug: "sheet-1" },
      { _id: "2", slug: "sheet-2" },
    ];
    mockGetAllInterviewSheetsFromDB.mockResolvedValue({
      data: allSheets,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toEqual(allSheets);
  });

  it("GET (no roadmap, slug) - single sheet → 200", async () => {
    const sheet = { _id: "1", slug: "my-sheet", title: "My Sheet" };
    mockGetInterviewSheetBySlugFromDB.mockResolvedValue({
      data: sheet,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { slug: "my-sheet" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toEqual(sheet);
  });

  it("GET (no roadmap, slug) - sheet not found → 404", async () => {
    mockGetInterviewSheetBySlugFromDB.mockResolvedValue({
      data: null,
      error: "Not found",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { slug: "missing-sheet" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Sheet not found");
  });

  it("GET (roadmap=DSA, metadata=true) → 200", async () => {
    const metadata = { domains: [], difficulties: [], topics: [] };
    mockGetDSASheetMetadataFromDB.mockResolvedValue({
      data: metadata,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { roadmap: "DSA", metadata: "true" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toEqual(metadata);
  });

  it("GET (roadmap=DSA, with filters) → 200", async () => {
    const grouped = [{ topic: "Arrays", questions: [] }];
    mockGetDSAQuestionsGroupedByTopic.mockResolvedValue({
      data: grouped,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {
        roadmap: "DSA",
        domain: "BACKEND",
        difficulty: "MEDIUM",
        companyType: "FAANG",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toEqual(grouped);
  });

  it("GET (roadmap=DSA, error) → 500", async () => {
    mockGetDSAQuestionsGroupedByTopic.mockResolvedValue({
      data: null,
      error: new Error("DB error"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { roadmap: "DSA" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Failed while fetching DSA questions");
  });

  it("GET (roadmap=APTITUDE, metadata=true) → 200", async () => {
    const metadata = { categories: [], counts: {} };
    mockGetAptitudeMetadataFromDB.mockResolvedValue({
      data: metadata,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { roadmap: "APTITUDE", metadata: "true" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toEqual(metadata);
  });

  it("GET (roadmap=APTITUDE, topic=slug) → 200", async () => {
    const questions = [{ _id: "q1", question: "Q1" }];
    mockGetAptitudeQuestionsByTopicFromDB.mockResolvedValue({
      data: questions,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { roadmap: "APTITUDE", topic: "arithmetic" },
    });

    await handler(req, res);

    expect(mockGetAptitudeQuestionsByTopicFromDB).toHaveBeenCalledWith(
      "arithmetic",
      expect.objectContaining({ mergeProgressForUserId: undefined }),
    );

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toEqual(questions);
  });

  it("GET (roadmap=APTITUDE, topic=slug, userId) passes mergeProgressForUserId", async () => {
    mockGetAptitudeQuestionsByTopicFromDB.mockResolvedValue({
      data: { questions: [], pagination: {} },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {
        roadmap: "APTITUDE",
        topic: "arithmetic",
        userId: "507f1f77bcf86cd799439011",
      },
    });

    await handler(req, res);

    expect(mockGetAptitudeQuestionsByTopicFromDB).toHaveBeenCalledWith(
      "arithmetic",
      expect.objectContaining({
        mergeProgressForUserId: "507f1f77bcf86cd799439011",
      }),
    );
    expect(res._getStatusCode()).toBe(200);
  });

  it("GET (roadmap=APTITUDE, category filter) → 200", async () => {
    const topics = [{ slug: "t1", count: 5 }];
    mockGetAptitudeTopicsWithQuestionCountFromDB.mockResolvedValue({
      data: topics,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { roadmap: "APTITUDE", category: "QUANTITATIVE" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toEqual(topics);
  });

  it("GET (roadmap=INVALID) → 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { roadmap: "INVALID" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Invalid roadmap");
    expect(data.message).toContain("INVALID");
  });
});
