import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockFindOne,
  mockLean,
  mockSelect,
  mockFindOneAndUpdate,
  MockGamificationConstructor,
} = vi.hoisted(() => {
  const mockFindOneInner = vi.fn();
  const mockLeanInner = vi.fn();
  const mockSelectInner = vi.fn(() => ({ lean: mockLeanInner }));
  const mockFindOneAndUpdateInner = vi.fn();

  const MockGamificationConstructorInner = vi.fn(function MockGamification(
    this: {
      userId: string;
      save: ReturnType<typeof vi.fn>;
      toObject: () => Record<string, unknown>;
    },
    doc: { userId: string },
  ) {
    this.userId = doc.userId;
    this.save = vi.fn().mockResolvedValue(this);
    this.toObject = () => ({
      _id: "g-new",
      userId: doc.userId,
      points: 0,
      actions: [{ actionType: "ENROLL_COURSE", pointsEarned: 5 }],
    });
  });

  Object.assign(MockGamificationConstructorInner, {
    findOne: (...args: unknown[]) => {
      mockFindOneInner(...args);
      return { select: mockSelectInner };
    },
    findOneAndUpdate: (...args: unknown[]) =>
      mockFindOneAndUpdateInner(...args),
  });

  return {
    mockFindOne: mockFindOneInner,
    mockLean: mockLeanInner,
    mockSelect: mockSelectInner,
    mockFindOneAndUpdate: mockFindOneAndUpdateInner,
    MockGamificationConstructor: MockGamificationConstructorInner,
  };
});

vi.mock("../../../../api/src/lib/database/models", () => ({
  Gamification: MockGamificationConstructor,
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

import {
  addGamificationDocInDB,
  getUserPointsFromDB,
  handleGamificationPoints,
  updateUserPointsInDB,
} from "../../../../api/src/lib/database/queries/gamification";

describe("gamification DB queries — client payloads omit actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserPointsFromDB", () => {
    it("chains select(-actions) and lean, and returns data without actions", async () => {
      const leanDoc = { _id: "g1", userId: "u1", points: 42 };
      mockLean.mockResolvedValue(leanDoc);

      const result = await getUserPointsFromDB("u1");

      expect(mockFindOne).toHaveBeenCalledWith({ userId: { $eq: "u1" } });
      expect(mockSelect).toHaveBeenCalledWith("-actions");
      expect(mockLean).toHaveBeenCalled();
      expect(result.data).toEqual(leanDoc);
      expect(result.data).not.toHaveProperty("actions");
    });
  });

  describe("addGamificationDocInDB", () => {
    it("returns saved doc without actions even when toObject included them", async () => {
      const result = await addGamificationDocInDB("u-new");

      expect(MockGamificationConstructor).toHaveBeenCalledWith({
        userId: "u-new",
      });
      expect(result.data).toMatchObject({
        _id: "g-new",
        userId: "u-new",
        points: 0,
      });
      expect(result.data).not.toHaveProperty("actions");
    });
  });

  describe("updateUserPointsInDB", () => {
    it("uses select -actions on findOneAndUpdate and returns data without actions", async () => {
      const updated = { _id: "g1", userId: "u1", points: 100 };
      mockFindOneAndUpdate.mockResolvedValue(updated);

      const result = await updateUserPointsInDB("u1", "ENROLL_COURSE");

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { userId: "u1" },
        expect.objectContaining({
          $push: expect.objectContaining({
            actions: expect.objectContaining({
              actionType: "ENROLL_COURSE",
            }),
          }),
          $inc: { points: expect.any(Number) },
        }),
        { new: true, select: "-actions" },
      );
      expect(result.data).toEqual(updated);
      expect(result.data).not.toHaveProperty("actions");
    });
  });

  describe("handleGamificationPoints (deduct path)", () => {
    it("returns payload without actions when deducting points", async () => {
      const afterDeduct = { _id: "g1", userId: "u1", points: 0 };
      mockFindOneAndUpdate.mockResolvedValue(afterDeduct);

      const result = await handleGamificationPoints(
        false,
        "u1",
        "ENROLL_COURSE",
      );

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { userId: "u1" },
        expect.any(Array),
        { new: true, select: "-actions" },
      );
      expect(result.data).toEqual(afterDeduct);
      expect(result.data).not.toHaveProperty("actions");
    });
  });
});
