import mongoose from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSession = {
  withTransaction: vi.fn(async (cb: () => Promise<unknown>) => cb()),
  endSession: vi.fn().mockResolvedValue(undefined),
};

vi.spyOn(mongoose, "startSession").mockResolvedValue(mockSession as any);

const {
  mockContributionSave,
  mockContributionFind,
  mockContributionFindById,
  mockContributionFindOneAndUpdate,
  mockContributionCountDocuments,
  mockSkip,
  mockLimit,
  mockLean,
  MockContributionConstructor,
} = vi.hoisted(() => {
  const mockContributionSaveInner = vi.fn();
  const mockContributionFindInner = vi.fn();
  const mockContributionFindByIdInner = vi.fn();
  const mockContributionFindOneAndUpdateInner = vi.fn();
  const mockContributionCountDocumentsInner = vi.fn();

  const mockSortInner = vi.fn();
  const mockSkipInner = vi.fn();
  const mockLimitInner = vi.fn();
  const mockLeanInner = vi.fn();

  mockLimitInner.mockReturnValue({
    lean: mockLeanInner,
  });

  mockSkipInner.mockReturnValue({
    limit: mockLimitInner,
  });

  mockSortInner.mockReturnValue({
    skip: mockSkipInner,
  });

  mockContributionFindInner.mockReturnValue({
    sort: mockSortInner,
  });

  const MockContributionConstructorInner = vi.fn(function MockContribution(
    this: any,
    doc: any,
  ) {
    Object.assign(this, doc);
    this.save = mockContributionSaveInner;
  });

  Object.assign(MockContributionConstructorInner, {
    find: (...args: unknown[]) => mockContributionFindInner(...args),
    findById: (...args: unknown[]) => mockContributionFindByIdInner(...args),
    findOneAndUpdate: (...args: unknown[]) =>
      mockContributionFindOneAndUpdateInner(...args),
    countDocuments: (...args: unknown[]) =>
      mockContributionCountDocumentsInner(...args),
  });

  return {
    mockContributionSave: mockContributionSaveInner,
    mockContributionFind: mockContributionFindInner,
    mockContributionFindById: mockContributionFindByIdInner,
    mockContributionFindOneAndUpdate: mockContributionFindOneAndUpdateInner,
    mockContributionCountDocuments: mockContributionCountDocumentsInner,
    mockSkip: mockSkipInner,
    mockLimit: mockLimitInner,
    mockLean: mockLeanInner,
    MockContributionConstructor: MockContributionConstructorInner,
  };
});

const mockUpdateContributorStatsInDB = vi.fn();
vi.mock("../../../../api/src/lib/database/queries/contributor", () => ({
  updateContributorStatsInDB: (...args: unknown[]) =>
    mockUpdateContributorStatsInDB(...args),
}));

vi.mock("../../../../api/src/lib/database/models", () => ({
  Contribution: MockContributionConstructor,
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

import {
  createContributionInDB,
  getContributionsByUserIdFromDB,
  getContributionsForAdminFromDB,
  reviewContributionInDB,
} from "../../../../api/src/lib/database/queries/contribution";

describe("Contribution Database Queries", () => {
  const validContributorId = "507f1f77bcf86cd799439011";
  const validUserId = "507f1f77bcf86cd799439012";
  const validContributionId = "507f1f77bcf86cd799439013";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createContributionInDB", () => {
    it("returns error for invalid contributorId or userId", async () => {
      const res1 = await createContributionInDB({
        contributorId: "invalid",
        userId: validUserId,
        contributorName: "Alice",
        contributorEmail: "alice@example.com",
        category: "youtube_video",
        proofUrl: "https://youtube.com/watch?v=123",
        title: "Video Tutorial",
      });
      expect(res1).toEqual({
        error: "Invalid contributor ID or user ID provided",
      });
    });

    it("saves contribution and atomically increments contributor pendingCount", async () => {
      mockContributionSave.mockResolvedValueOnce(true);
      mockUpdateContributorStatsInDB.mockResolvedValueOnce({ data: {} });

      const res = await createContributionInDB({
        contributorId: validContributorId,
        userId: validUserId,
        contributorName: "  Alice  ",
        contributorEmail: "  Alice@Example.com  ",
        category: "EVENT_SESSION",
        proofUrl: "  https://youtube.com/watch?v=123  ",
        title: "  Event Session  ",
      });

      expect(mockContributionSave).toHaveBeenCalled();
      expect(mockUpdateContributorStatsInDB).toHaveBeenCalledWith({
        contributorId: validContributorId,
        pendingDelta: 1,
        session: expect.anything(),
      });
      expect(res.data).toBeDefined();
      expect(res.data.status).toBe("pending");
      expect(res.data.standardXp).toBe(15);
      expect(res.data.typeGroup).toBe("community");
    });

    it("fails and rolls back if updating contributor pending count fails", async () => {
      mockContributionSave.mockResolvedValueOnce(true);
      mockUpdateContributorStatsInDB.mockResolvedValueOnce({
        error: "Contributor not found",
      });

      const res = await createContributionInDB({
        contributorId: validContributorId,
        userId: validUserId,
        contributorName: "Alice",
        contributorEmail: "alice@example.com",
        category: "PR_BUG_FIX",
        proofUrl: "https://github.com/pull/1",
        title: "PR Title",
      });

      expect(res.error).toBe("Contributor not found");
    });
  });

  describe("getContributionsByUserIdFromDB", () => {
    it("rejects invalid userId", async () => {
      const res = await getContributionsByUserIdFromDB("invalid");
      expect(res).toEqual({ error: "Invalid user ID provided" });
    });

    it("applies filters and pagination properly", async () => {
      const mockItems = [{ _id: validContributionId, title: "Test" }];
      mockLean.mockResolvedValueOnce(mockItems);
      mockContributionCountDocuments.mockResolvedValueOnce(25);

      const res = await getContributionsByUserIdFromDB(validUserId, {
        status: "approved",
        category: "BLOG",
        typeGroup: "blogs",
        page: 2,
        limit: 10,
      });

      expect(mockContributionFind).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "approved",
          category: "BLOG",
          typeGroup: "blogs",
        }),
      );
      expect(mockSkip).toHaveBeenCalledWith(10);
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(res.data).toEqual({
        items: mockItems,
        total: 25,
        currentPage: 2,
        totalPages: 3,
      });
    });
  });

  describe("getContributionsForAdminFromDB", () => {
    it("filters by status and category, ignoring 'all', and escapes search regex", async () => {
      mockLean.mockResolvedValueOnce([]);
      mockContributionCountDocuments.mockResolvedValueOnce(0);

      await getContributionsForAdminFromDB({
        status: "all",
        category: "PR_BUG_FIX",
        search: "test+user (admin)",
        page: 1,
        limit: 20,
      });

      expect(mockContributionFind).toHaveBeenCalledWith({
        category: "PR_BUG_FIX",
        $or: [
          { title: expect.any(RegExp) },
          { contributorName: expect.any(RegExp) },
          { contributorEmail: expect.any(RegExp) },
        ],
      });
    });

    it("does not apply category when set to 'all' or empty", async () => {
      mockLean.mockResolvedValueOnce([]);
      mockContributionCountDocuments.mockResolvedValueOnce(0);

      await getContributionsForAdminFromDB({
        category: "all",
      });

      expect(mockContributionFind).toHaveBeenCalledWith({});
    });
  });

  describe("reviewContributionInDB", () => {
    it("rejects invalid contributionId", async () => {
      const res = await reviewContributionInDB({
        contributionId: "invalid",
        adminEmail: "admin@example.com",
        action: "approve",
      });
      expect(res).toEqual({ error: "Invalid contribution ID provided" });
    });

    it("returns error if contribution does not exist", async () => {
      mockContributionFindById.mockResolvedValueOnce(null);
      const res = await reviewContributionInDB({
        contributionId: validContributionId,
        adminEmail: "admin@example.com",
        action: "approve",
      });
      expect(res).toEqual({ error: "Contribution submission not found" });
    });

    it("returns error if contribution is already reviewed", async () => {
      mockContributionFindById.mockResolvedValueOnce({
        _id: validContributionId,
        status: "approved",
      });
      const res = await reviewContributionInDB({
        contributionId: validContributionId,
        adminEmail: "admin@example.com",
        action: "approve",
      });
      expect(res.error).toContain("already been reviewed");
    });

    it("handles concurrent review conflict when findOneAndUpdate returns null", async () => {
      mockContributionFindById.mockResolvedValueOnce({
        _id: validContributionId,
        status: "pending",
        standardXp: 50,
      });
      mockContributionFindOneAndUpdate.mockResolvedValueOnce(null);

      const res = await reviewContributionInDB({
        contributionId: validContributionId,
        adminEmail: "admin@example.com",
        action: "approve",
      });

      expect(res.error).toContain("already reviewed concurrently");
    });

    it("approves contribution and updates contributor stats with XP and count deltas", async () => {
      const pendingDoc = {
        _id: validContributionId,
        contributorId: validContributorId,
        status: "pending",
        standardXp: 50,
      };
      const approvedDoc = {
        ...pendingDoc,
        status: "approved",
        awardedXp: 75,
        reviewedBy: "admin@example.com",
      };

      mockContributionFindById.mockResolvedValueOnce(pendingDoc);
      mockContributionFindOneAndUpdate.mockResolvedValueOnce(approvedDoc);
      mockUpdateContributorStatsInDB.mockResolvedValueOnce({ data: {} });

      const res = await reviewContributionInDB({
        contributionId: validContributionId,
        adminEmail: "admin@example.com",
        action: "approve",
        awardedXp: 75,
        feedback: "Great job!",
      });

      expect(mockContributionFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.anything(), status: "pending" },
        expect.objectContaining({
          $set: expect.objectContaining({
            status: "approved",
            awardedXp: 75,
            adminFeedback: "Great job!",
            reviewedBy: "admin@example.com",
          }),
        }),
        expect.objectContaining({ new: true }),
      );

      expect(mockUpdateContributorStatsInDB).toHaveBeenCalledWith({
        contributorId: validContributorId,
        xpDelta: 75,
        approvedDelta: 1,
        pendingDelta: -1,
        session: expect.anything(),
      });

      expect(res.data).toEqual(approvedDoc);
    });

    it("rejects contribution and decrements pendingCount with zero XP delta", async () => {
      const pendingDoc = {
        _id: validContributionId,
        contributorId: validContributorId,
        status: "pending",
        standardXp: 50,
      };
      const rejectedDoc = {
        ...pendingDoc,
        status: "rejected",
        awardedXp: 0,
        reviewedBy: "admin@example.com",
      };

      mockContributionFindById.mockResolvedValueOnce(pendingDoc);
      mockContributionFindOneAndUpdate.mockResolvedValueOnce(rejectedDoc);
      mockUpdateContributorStatsInDB.mockResolvedValueOnce({ data: {} });

      const res = await reviewContributionInDB({
        contributionId: validContributionId,
        adminEmail: "admin@example.com",
        action: "reject",
      });

      expect(mockContributionFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.anything(), status: "pending" },
        expect.objectContaining({
          $set: expect.objectContaining({
            status: "rejected",
            awardedXp: 0,
            adminFeedback: "Submission does not meet contribution guidelines.",
          }),
        }),
        expect.objectContaining({ new: true }),
      );

      expect(mockUpdateContributorStatsInDB).toHaveBeenCalledWith({
        contributorId: validContributorId,
        pendingDelta: -1,
        session: expect.anything(),
      });

      expect(res.data).toEqual(rejectedDoc);
    });
  });
});
