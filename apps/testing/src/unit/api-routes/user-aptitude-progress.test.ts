import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockMarkAptitudeQuestionCompletedByUser = vi.fn();
const mockHandleGamificationPoints = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

vi.mock("../../../../api/src/lib/database", () => ({
  markAptitudeQuestionCompletedByUser: (...args: unknown[]) =>
    mockMarkAptitudeQuestionCompletedByUser(...args),
  handleGamificationPoints: (...args: unknown[]) =>
    mockHandleGamificationPoints(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (
    fn: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  ) => fn,
}));

vi.mock("../../../../api/src/lib/services/admin-cache", () => ({
  isAdminEmail: vi.fn().mockResolvedValue(false),
  warmAdminEmailCache: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../api/src/middleware/admin", () => ({
  verifyAuthenticatedUser: vi.fn().mockImplementation((req) => {
    const userId =
      req.query?.userId || req.body?.userId || "507f1f77bcf86cd799439011";
    return {
      sub: userId,
      email: "test@example.com",
      name: "Test User",
      type: "access",
    };
  }),
  withUserAuth: (handler: any) => handler,
  isAdminEmail: vi.fn().mockResolvedValue(false),
}));

import handler from "../../../../api/src/pages/api/v1/user/interview-prep/aptitude/progress";

describe("PATCH /user/interview-prep/aptitude/progress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when body is incomplete", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      body: { userId: "u1", topicSlug: "algebra" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(mockMarkAptitudeQuestionCompletedByUser).not.toHaveBeenCalled();
  });

  it("returns 404 when topic/question not found", async () => {
    mockMarkAptitudeQuestionCompletedByUser.mockResolvedValue({
      error: "Question not found for topic",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      body: {
        userId: "507f1f77bcf86cd799439011",
        topicSlug: "algebra",
        questionId: "507f1f77bcf86cd799439012",
        isCompleted: true,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(mockMarkAptitudeQuestionCompletedByUser).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      "algebra",
      "507f1f77bcf86cd799439012",
      true,
    );
    expect(mockHandleGamificationPoints).not.toHaveBeenCalled();
  });

  it("updates progress and runs gamification on success", async () => {
    mockMarkAptitudeQuestionCompletedByUser.mockResolvedValue({
      data: { _id: "doc1" },
    });
    mockHandleGamificationPoints.mockResolvedValue({ data: {} });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      body: {
        userId: "507f1f77bcf86cd799439011",
        topicSlug: "algebra",
        questionId: "507f1f77bcf86cd799439012",
        isCompleted: true,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData() as string);
    expect(body.status).toBe(true);
    expect(mockHandleGamificationPoints).toHaveBeenCalledWith(
      true,
      "507f1f77bcf86cd799439011",
      "COMPLETE_APTITUDE_QUESTION",
    );
  });
});
