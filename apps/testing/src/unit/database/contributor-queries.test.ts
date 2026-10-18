import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockFind,
  mockFindOne,
  mockFindByIdAndUpdate,
  mockFindOneAndUpdate,
  mockSort,
  mockLimit,
  mockSelect,
  mockLean,
  MockContributorConstructor,
} = vi.hoisted(() => {
  const mockFindInner = vi.fn();
  const mockFindOneInner = vi.fn();
  const mockFindByIdAndUpdateInner = vi.fn();
  const mockFindOneAndUpdateInner = vi.fn();
  const mockSortInner = vi.fn();
  const mockLimitInner = vi.fn();
  const mockSelectInner = vi.fn();
  const mockLeanInner = vi.fn();

  mockLimitInner.mockReturnValue({
    select: mockSelectInner.mockReturnValue({
      lean: mockLeanInner,
    }),
  });

  mockSortInner.mockReturnValue({
    limit: mockLimitInner,
  });

  mockFindInner.mockReturnValue({
    sort: mockSortInner,
  });

  const MockContributorConstructorInner = vi.fn();
  Object.assign(MockContributorConstructorInner, {
    find: (...args: unknown[]) => mockFindInner(...args),
    findOne: (...args: unknown[]) => ({
      lean: () => mockFindOneInner(...args),
    }),
    findByIdAndUpdate: (...args: unknown[]) =>
      mockFindByIdAndUpdateInner(...args),
    findOneAndUpdate: (...args: unknown[]) => ({
      lean: () => mockFindOneAndUpdateInner(...args),
    }),
  });

  return {
    mockFind: mockFindInner,
    mockFindOne: mockFindOneInner,
    mockFindByIdAndUpdate: mockFindByIdAndUpdateInner,
    mockFindOneAndUpdate: mockFindOneAndUpdateInner,
    mockSort: mockSortInner,
    mockLimit: mockLimitInner,
    mockSelect: mockSelectInner,
    mockLean: mockLeanInner,
    MockContributorConstructor: MockContributorConstructorInner,
  };
});

vi.mock("../../../../api/src/lib/database/models", () => ({
  Contributor: MockContributorConstructor,
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

import {
  getContributorByUserIdFromDB,
  getContributorLeaderboard,
  getContributorLeaderboardFromDB,
  getOrCreateContributorInDB,
  updateContributorStatsInDB,
} from "../../../../api/src/lib/database/queries/contributor";

describe("Contributor Database Queries", () => {
  const validUserId = "507f1f77bcf86cd799439011";
  const validContributorId = "507f1f77bcf86cd799439022";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getContributorByUserIdFromDB", () => {
    it("returns error if userId is invalid", async () => {
      const result = await getContributorByUserIdFromDB("invalid-id");
      expect(result).toEqual({ error: "Invalid user ID provided" });
      expect(mockFindOne).not.toHaveBeenCalled();
    });

    it("returns error if contributor profile does not exist", async () => {
      mockFindOne.mockResolvedValueOnce(null);
      const result = await getContributorByUserIdFromDB(validUserId);
      expect(result).toEqual({ error: "Contributor profile not found" });
    });

    it("returns contributor profile when found", async () => {
      const mockProfile = {
        _id: validContributorId,
        userId: validUserId,
        name: "Test Contributor",
        totalXp: 120,
      };
      mockFindOne.mockResolvedValueOnce(mockProfile);

      const result = await getContributorByUserIdFromDB(validUserId);
      expect(result.data).toEqual(mockProfile);
    });
  });

  describe("getOrCreateContributorInDB", () => {
    it("returns error if userId is invalid", async () => {
      const result = await getOrCreateContributorInDB({
        userId: "invalid-id",
        email: "test@example.com",
        name: "Test",
      });
      expect(result).toEqual({ error: "Invalid user ID provided" });
    });

    it("atomically upserts contributor profile with default fields and trims strings", async () => {
      const mockContributor = {
        _id: validContributorId,
        userId: validUserId,
        email: "test@example.com",
        name: "Test Contributor",
        role: "Contributor",
        totalXp: 0,
        approvedCount: 0,
        pendingCount: 0,
        isCaptain: false,
      };
      mockFindOneAndUpdate.mockResolvedValueOnce(mockContributor);

      const result = await getOrCreateContributorInDB({
        userId: validUserId,
        email: "  Test@Example.Com  ",
        name: "  Test Contributor  ",
        avatar: "  https://example.com/avatar.png  ",
      });

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { userId: expect.anything() },
        {
          $setOnInsert: {
            userId: expect.anything(),
            email: "test@example.com",
            name: "Test Contributor",
            avatar: "https://example.com/avatar.png",
            role: "Contributor",
            totalXp: 0,
            approvedCount: 0,
            pendingCount: 0,
            isCaptain: false,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      expect(result.data).toEqual(mockContributor);
    });
  });

  describe("updateContributorStatsInDB", () => {
    it("executes single atomic aggregation update pipeline and supports session", async () => {
      const mockSession = {} as any;
      const updatedDoc = {
        _id: validContributorId,
        totalXp: 350,
        approvedCount: 5,
        pendingCount: 0,
        isCaptain: true,
        role: "TBE Captain",
      };
      mockFindByIdAndUpdate.mockResolvedValueOnce(updatedDoc);

      const result = await updateContributorStatsInDB({
        contributorId: validContributorId,
        xpDelta: 100,
        approvedDelta: 1,
        pendingDelta: -1,
        session: mockSession,
      });

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining([
          expect.objectContaining({
            $set: expect.objectContaining({
              totalXp: { $add: [{ $ifNull: ["$totalXp", 0] }, 100] },
              approvedCount: { $add: [{ $ifNull: ["$approvedCount", 0] }, 1] },
              pendingCount: { $add: [{ $ifNull: ["$pendingCount", 0] }, -1] },
            }),
          }),
          expect.objectContaining({
            $set: expect.objectContaining({
              isCaptain: expect.any(Object),
              role: expect.any(Object),
              captainUnlockedAt: expect.any(Object),
            }),
          }),
        ]),
        { new: true, session: mockSession },
      );
      expect(result.data).toEqual(updatedDoc);
    });

    it("returns error if contributor is not found", async () => {
      mockFindByIdAndUpdate.mockResolvedValueOnce(null);

      const result = await updateContributorStatsInDB({
        contributorId: validContributorId,
        xpDelta: 50,
      });

      expect(result).toEqual({
        error: "Contributor not found for statistics update",
      });
    });
  });

  describe("getContributorLeaderboardFromDB and alias", () => {
    it("fetches top contributors with bounded limit and sorting", async () => {
      const mockLeaderboard = [
        { name: "Alice", totalXp: 500, isCaptain: true },
        { name: "Bob", totalXp: 200, isCaptain: false },
      ];
      mockLean.mockResolvedValueOnce(mockLeaderboard);

      const result = await getContributorLeaderboardFromDB(15);

      expect(mockFind).toHaveBeenCalledWith({});
      expect(mockSort).toHaveBeenCalledWith({ totalXp: -1, createdAt: 1 });
      expect(mockLimit).toHaveBeenCalledWith(15);
      expect(mockSelect).toHaveBeenCalledWith(
        "name avatar githubUsername role totalXp approvedCount isCaptain",
      );
      expect(result.data).toEqual(mockLeaderboard);
    });

    it("clamps limit between 1 and 100", async () => {
      mockLean.mockResolvedValueOnce([]);
      await getContributorLeaderboardFromDB(500);
      expect(mockLimit).toHaveBeenCalledWith(100);

      mockLean.mockResolvedValueOnce([]);
      await getContributorLeaderboardFromDB(-5);
      expect(mockLimit).toHaveBeenCalledWith(1);
    });

    it("alias getContributorLeaderboard calls the same implementation", async () => {
      expect(getContributorLeaderboard).toBe(getContributorLeaderboardFromDB);
    });
  });
});
