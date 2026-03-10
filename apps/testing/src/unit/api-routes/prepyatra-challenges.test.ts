import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";

// Hoist mocks
const {
  mockChallengeSave,
  mockUserFindOne,
  mockConnectDB,
  mockCors,
  mockChallengeFind,
} = vi.hoisted(() => ({
  mockChallengeSave: vi.fn(),
  mockUserFindOne: vi.fn(),
  mockConnectDB: vi.fn(),
  mockCors: vi.fn(),
  mockChallengeFind: vi.fn(),
}));

// Mock the models and database
vi.mock("@/lib/database", () => {
  const mockChallenge: any = vi.fn().mockImplementation(function (data) {
    this.data = data;
    this.save = mockChallengeSave;
    return this;
  });
  mockChallenge.find = mockChallengeFind;

  return {
    Challenge: mockChallenge,
    User: {
      findOne: mockUserFindOne,
    },
    updateUserSkillsInDB: vi.fn(),
  };
});

// Mock utils
vi.mock("@/lib/utils", () => ({
  cors: (...args: any[]) => mockCors(...args),
  sendAPIResponse: (data: any) => data,
  captureAPIError: vi.fn(),
}));

vi.mock("@/middleware/api", () => ({
  connectDB: () => mockConnectDB(),
}));

vi.mock("@/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    RESOURCE_CREATED: 201,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

// Import handler after mocks
import handler from "../../../../api/src/pages/api/v1/prepyatra/challenges/index";

describe("PrepYatra Challenges API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCors.mockResolvedValue(undefined);
    mockConnectDB.mockResolvedValue(undefined);
    mockChallengeFind.mockReturnValue({
      sort: vi.fn().mockResolvedValue([]),
    });
  });

  describe("POST /api/v1/prepyatra/challenges", () => {
    it("should create a challenge with an ObjectId userId", async () => {
      const validObjectId = "507f1f77bcf86cd799439011";
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          name: "30 Days of Code",
          totalDays: 30,
          category: "Programming",
          userId: validObjectId,
        },
      });

      mockChallengeSave.mockResolvedValue({ _id: "challenge123" });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(true);
      expect(mockChallengeSave).toHaveBeenCalled();
      expect(mockUserFindOne).not.toHaveBeenCalled();
    });

    it("should create a challenge with an email userId by looking up the user", async () => {
      const emailUserId = "test@example.com";
      const mockUserDoc = { _id: "user_mongo_id_123" };

      mockUserFindOne.mockResolvedValue(mockUserDoc);
      mockChallengeSave.mockResolvedValue({ _id: "challenge123" });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          name: "30 Days of Code",
          totalDays: 30,
          category: "Programming",
          userId: emailUserId,
        },
      });

      await handler(req, res);

      expect(mockUserFindOne).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(true);
    });

    it("should support all the new challenge fields", async () => {
      const validObjectId = "507f1f77bcf86cd799439011";
      const fullChallengeData = {
        name: "30 Days of React",
        totalDays: 30,
        category: "Web Development",
        userId: validObjectId,
        description: "Master React in 30 days",
        difficulty: "Intermediate",
        estimatedHoursPerDay: 2,
        tags: ["React", "JS"],
        learningPath: ["Hooks", "State"],
        isPredefined: true,
        predefinedType: "react30",
        gamificationPoints: 100,
      };

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: fullChallengeData,
      });

      mockChallengeSave.mockResolvedValue({ _id: "challenge123" });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(mockChallengeSave).toHaveBeenCalled();
    });
  });

  describe("GET /api/v1/prepyatra/challenges", () => {
    it("should fetch challenges for a user", async () => {
      const validObjectId = "507f1f77bcf86cd799439011";
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: validObjectId },
      });

      const mockChallenges = [{ name: "Challenge 1" }];
      mockChallengeFind.mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockChallenges),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data).toEqual(mockChallenges);
    });
  });
});
