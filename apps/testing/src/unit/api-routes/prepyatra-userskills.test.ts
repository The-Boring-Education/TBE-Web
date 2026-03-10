import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";

// Hoist mocks
const {
  mockUpdateUserSkillsInDB,
  mockUserFindOne,
  mockUserFindByIdAndUpdate,
  mockConnectDB,
  mockCors,
} = vi.hoisted(() => ({
  mockUpdateUserSkillsInDB: vi.fn(),
  mockUserFindOne: vi.fn(),
  mockUserFindByIdAndUpdate: vi.fn(),
  mockConnectDB: vi.fn(),
  mockCors: vi.fn(),
}));

// Mock the models and database
vi.mock("@/lib/database", () => {
  return {
    updateUserSkillsInDB: mockUpdateUserSkillsInDB,
    User: {
      findOne: mockUserFindOne,
      findByIdAndUpdate: mockUserFindByIdAndUpdate,
    },
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
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

// Import handler after mocks
import handler from "../../../../api/src/pages/api/v1/prepyatra/userskills";

describe("PrepYatra UserSkills API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCors.mockResolvedValue(undefined);
    mockConnectDB.mockResolvedValue(undefined);
  });

  describe("POST /api/v1/prepyatra/userskills", () => {
    it("should add skills for a valid ObjectId userId", async () => {
      const validObjectId = "507f1f77bcf86cd799439011";
      mockUpdateUserSkillsInDB.mockResolvedValue({
        data: { _id: validObjectId },
        error: null,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          userId: validObjectId,
          userSkills: ["React", "TypeScript"],
        },
      });

      await handler(req, res);

      expect(mockUpdateUserSkillsInDB).toHaveBeenCalledWith(validObjectId, [
        "React",
        "TypeScript",
      ]);
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(true);
    });

    it("should add skills for an email userId by looking up the user", async () => {
      const emailUserId = "test@example.com";
      const mongoId = "507f1f77bcf86cd799439011";
      mockUserFindOne.mockResolvedValue({ _id: mongoId });
      mockUpdateUserSkillsInDB.mockResolvedValue({
        data: { _id: mongoId },
        error: null,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          userId: emailUserId,
          userSkills: ["Node.js"],
        },
      });

      await handler(req, res);

      expect(mockUserFindOne).toHaveBeenCalled();
      expect(mockUpdateUserSkillsInDB).toHaveBeenCalledWith(mongoId, [
        "Node.js",
      ]);
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(true);
    });
  });

  describe("DELETE /api/v1/prepyatra/userskills", () => {
    it("should remove a skill successfully", async () => {
      const validObjectId = "507f1f77bcf86cd799439011";
      mockUserFindByIdAndUpdate.mockResolvedValue({
        _id: validObjectId,
        userSkills: ["React"],
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        body: {
          userId: validObjectId,
          skill: "TypeScript",
        },
      });

      await handler(req, res);

      expect(mockUserFindByIdAndUpdate).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe(true);
      expect(data.message).toContain("removed successfully");
    });

    it("should handle removing a skill by email lookup", async () => {
      const emailUserId = "test@example.com";
      const mongoId = "507f1f77bcf86cd799439011";
      mockUserFindOne.mockResolvedValue({ _id: mongoId });
      mockUserFindByIdAndUpdate.mockResolvedValue({
        _id: mongoId,
        userSkills: [],
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        body: {
          userId: emailUserId,
          skill: "Node.js",
        },
      });

      await handler(req, res);

      expect(mockUserFindOne).toHaveBeenCalled();
      expect(mockUserFindByIdAndUpdate).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
    });
  });
});
