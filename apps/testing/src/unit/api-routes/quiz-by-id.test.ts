import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import handler from "../../../../api/src/pages/api/v1/quiz/[id]";

const mockGetQuizByIdFromDB = vi.fn();
const mockUpdateAQuizInDB = vi.fn();
const mockAppendQuestionsToQuizInDB = vi.fn();
const mockEnsureAdminAccess = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  getQuizByIdFromDB: (...args: unknown[]) => mockGetQuizByIdFromDB(...args),
  updateAQuizInDB: (...args: unknown[]) => mockUpdateAQuizInDB(...args),
  appendQuestionsToQuizInDB: (...args: unknown[]) =>
    mockAppendQuestionsToQuizInDB(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/middleware/admin", () => ({
  ensureAdminAccess: (...args: unknown[]) => mockEnsureAdminAccess(...args),
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (h: typeof handler) => h,
}));

/** Simulates ensureAdminAccess denying access: writes 401 and returns false. */
const denyAdmin = async (
  _req: NextApiRequest,
  res: NextApiResponse,
): Promise<boolean> => {
  res.status(401).json({ status: false, message: "Authentication required" });
  return false;
};

describe("GET /api/v1/quiz/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureAdminAccess.mockResolvedValue(true);
  });

  it("returns at most 10 questions for default client GET", async () => {
    const questions = Array.from({ length: 32 }, (_, i) => ({
      question: `Q${i}`,
      options: ["a", "b"],
      correctAnswer: 0,
      explanation: "e",
      detailedExplanation: "d",
      difficulty: "easy",
    }));

    mockGetQuizByIdFromDB.mockResolvedValue({
      data: {
        _id: "id1",
        categoryName: "Cat",
        categoryDescription: "D",
        categoryIcon: "i",
        questions,
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { id: "id1", shuffle: "false" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData());
    expect(body.data.questions).toHaveLength(10);
    expect(body.data.questions[0]).not.toHaveProperty("difficulty");
  });

  it("GET is public (never invokes admin gate)", async () => {
    mockGetQuizByIdFromDB.mockResolvedValue({
      data: {
        _id: "id1",
        categoryName: "Cat",
        categoryDescription: "D",
        categoryIcon: "i",
        questions: [],
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { id: "id1" },
    });

    await handler(req, res);

    expect(mockEnsureAdminAccess).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
  });

  it("ignores the legacy ?admin=true param and never returns difficulty", async () => {
    const questions = Array.from({ length: 12 }, (_, i) => ({
      question: `Q${i}`,
      options: ["a", "b"],
      correctAnswer: 0,
      explanation: "e",
      detailedExplanation: "d",
      difficulty: "medium",
    }));

    mockGetQuizByIdFromDB.mockResolvedValue({
      data: {
        _id: "id1",
        categoryName: "Cat",
        categoryDescription: "D",
        categoryIcon: "i",
        isActive: true,
        questions,
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {
        id: "id1",
        admin: "true",
        includeInactive: "true",
        shuffle: "false",
      },
    });

    await handler(req, res);

    expect(mockEnsureAdminAccess).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData());
    // Legacy privileged shape is gone: capped at 10, difficulty stripped.
    expect(body.data.questions).toHaveLength(10);
    expect(body.data.questions[0]).not.toHaveProperty("difficulty");
    expect(body.data).not.toHaveProperty("isActive");
  });
});

describe("PUT /api/v1/quiz/[id] (admin-gated)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureAdminAccess.mockResolvedValue(true);
  });

  it("rejects an unauthenticated PUT with 401 and does not write", async () => {
    mockEnsureAdminAccess.mockImplementation(denyAdmin);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PUT",
      query: { id: "id1" },
      body: { categoryName: "Hacked" },
    });

    await handler(req, res);

    expect(mockEnsureAdminAccess).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(401);
    expect(mockUpdateAQuizInDB).not.toHaveBeenCalled();
  });

  it("allows an admin PUT to update the quiz", async () => {
    mockUpdateAQuizInDB.mockResolvedValue({
      data: { _id: "id1", categoryName: "Updated" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PUT",
      query: { id: "id1" },
      body: { categoryName: "Updated" },
    });

    await handler(req, res);

    expect(mockEnsureAdminAccess).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
    expect(mockUpdateAQuizInDB).toHaveBeenCalled();
  });
});

describe("POST /api/v1/quiz/[id] (admin-gated)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureAdminAccess.mockResolvedValue(true);
  });

  it("rejects an unauthenticated POST with 401 and does not append", async () => {
    mockEnsureAdminAccess.mockImplementation(denyAdmin);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "id1" },
      body: { questions: [{ question: "Q" }] },
    });

    await handler(req, res);

    expect(mockEnsureAdminAccess).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(401);
    expect(mockAppendQuestionsToQuizInDB).not.toHaveBeenCalled();
  });

  it("allows an admin POST to append questions", async () => {
    mockAppendQuestionsToQuizInDB.mockResolvedValue({
      data: { _id: "id1" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "id1" },
      body: {
        questions: [{ question: "Q", options: ["a"], correctAnswer: 0 }],
      },
    });

    await handler(req, res);

    expect(mockEnsureAdminAccess).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
    expect(mockAppendQuestionsToQuizInDB).toHaveBeenCalled();
  });
});
