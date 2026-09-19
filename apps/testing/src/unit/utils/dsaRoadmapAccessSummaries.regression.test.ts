import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  aggregate: vi.fn(),
  findById: vi.fn(),
  payment: vi.fn(),
  progress: vi.fn(),
}));

vi.mock("@/lib/database/models", () => ({
  DSAQuestion: { aggregate: mocks.aggregate },
  User: { findById: mocks.findById },
  InterviewSheet: {},
  StudyGuide: {},
  UserSheet: {},
}));
vi.mock("@/lib/database/queries/payment", () => ({
  checkPaymentStatusFromDB: mocks.payment,
}));
vi.mock("@/lib/database/queries/dsayatra", () => ({
  getDsaYatraProgressFromDB: mocks.progress,
}));
vi.mock("@/lib/database/queries/gamification", () => ({
  updateUserPointsInDB: vi.fn(),
}));
vi.mock("@/lib/utils", () => ({
  generateYouTubeSearchLink: vi.fn(),
}));
vi.mock("@/lib/utils/logger", () => ({
  logger: { error: vi.fn() },
}));

import {
  applyDsaFreemiumGate,
  buildDsaSortFieldsStage,
  DSA_SORT_STAGE,
} from "@/lib/database/queries/dsaSheet";
import { getDSATopicSummariesFromDB } from "@/lib/database/queries/interview-prep";

const question = (
  index: number,
  topics: string[],
  difficulty = "EASY",
  isRealWorldProblem = false,
) => ({
  _id: new Types.ObjectId(index.toString(16).padStart(24, "0")),
  topics,
  difficulty,
  isRealWorldProblem,
});

const rows = [
  question(1, ["ARRAY", "HASHMAP"]),
  question(2, ["ARRAY", "STRING"]),
  question(3, ["ARRAY"]),
  question(4, ["ARRAY"]),
  question(5, ["STRING"]),
  question(6, ["GRAPH"], "MEDIUM"),
  question(7, ["GRAPH"], "MEDIUM"),
  question(8, ["GRAPH"], "MEDIUM"),
  question(9, ["TREE"], "HARD"),
  question(10, ["TREE"], "HARD"),
  question(11, ["DESIGN"], "HARD", true),
  question(12, ["DESIGN"], "HARD", true),
];

describe("roadmap accessible primary-topic summaries regression", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.aggregate.mockResolvedValue(rows);
    mocks.findById.mockReturnValue({
      select: () => ({
        lean: async () => ({ dsaYatra: { target: "Product-based" } }),
      }),
    });
    mocks.payment.mockResolvedValue({ data: { purchased: false } });
    mocks.progress.mockResolvedValue({
      data: {
        completedQuestionIds: [
          String(rows[0]._id),
          String(rows[0]._id),
          ...rows.slice(3).map((row) => String(row._id)),
          "deleted-question",
        ],
      },
    });
  });

  it("counts primary topics once and intersects solved IDs with the sheet's free access set", async () => {
    const result = await getDSATopicSummariesFromDB("user");
    expect(result.error).toBeUndefined();
    expect(result.data.topics).toEqual(
      expect.arrayContaining([
        {
          topic: "ARRAY",
          count: 4,
          solved: 2,
          accessibleCount: 3,
          accessibleSolved: 1,
        },
        {
          topic: "STRING",
          count: 1,
          solved: 1,
          accessibleCount: 0,
          accessibleSolved: 0,
        },
        {
          topic: "GRAPH",
          count: 3,
          solved: 3,
          accessibleCount: 2,
          accessibleSolved: 2,
        },
        {
          topic: "TREE",
          count: 2,
          solved: 2,
          accessibleCount: 1,
          accessibleSolved: 1,
        },
        {
          topic: "DESIGN",
          count: 2,
          solved: 2,
          accessibleCount: 1,
          accessibleSolved: 1,
        },
      ]),
    );
    expect(result.data.topics).toHaveLength(5);
    const gated = applyDsaFreemiumGate(rows, 1, rows.length).questions;
    expect(gated.filter((row) => !row.isLocked)).toHaveLength(7);
    expect(mocks.aggregate).toHaveBeenCalledWith([
      buildDsaSortFieldsStage(["MNC", "FAANG"]),
      DSA_SORT_STAGE,
      { $project: { _id: 1, topics: 1, difficulty: 1, isRealWorldProblem: 1 } },
    ]);
    expect(mocks.payment).toHaveBeenCalledWith("user", "lifetime", "DSA_YATRA");
  });

  it("includes all primary-topic questions for paid users and respects the requested product", async () => {
    mocks.payment.mockResolvedValue({ data: { purchased: true } });
    const result = await getDSATopicSummariesFromDB("user", "ONCAMPUS");
    expect(mocks.payment).toHaveBeenCalledWith("user", "lifetime", "ONCAMPUS");
    for (const row of result.data.topics) {
      expect(row.accessibleCount).toBe(row.count);
      expect(row.accessibleSolved).toBe(row.solved);
    }
    expect(result.data.topics).toHaveLength(5);
  });

  it("uses freemium caps with zero solved for anonymous users", async () => {
    const result = await getDSATopicSummariesFromDB();
    expect(mocks.payment).not.toHaveBeenCalled();
    expect(mocks.progress).not.toHaveBeenCalled();
    expect(result.data.topics).toContainEqual({
      topic: "STRING",
      count: 1,
      solved: 0,
      accessibleCount: 0,
      accessibleSolved: 0,
    });
  });

  it("returns an empty summary for an empty sheet", async () => {
    mocks.aggregate.mockResolvedValue([]);
    expect(await getDSATopicSummariesFromDB()).toEqual({
      data: { topics: [] },
    });
  });

  it("gates before dropping questions without a primary topic", async () => {
    mocks.aggregate.mockResolvedValue([
      question(1, []),
      question(2, []),
      question(3, []),
      question(4, ["ARRAY"]),
    ]);
    const result = await getDSATopicSummariesFromDB();
    expect(result.data.topics).toEqual([
      {
        topic: "ARRAY",
        count: 1,
        solved: 0,
        accessibleCount: 0,
        accessibleSolved: 0,
      },
    ]);
  });

  it.each(["payment", "progress"] as const)(
    "returns %s errors rather than inaccurate progress",
    async (source) => {
      mocks[source].mockResolvedValue({ error: "Unavailable" });
      expect(await getDSATopicSummariesFromDB("user")).toEqual({
        error: "Unavailable",
      });
      expect(mocks.aggregate).not.toHaveBeenCalled();
    },
  );

  it("returns database failures without throwing", async () => {
    mocks.aggregate.mockRejectedValue(new Error("Unavailable"));
    expect(await getDSATopicSummariesFromDB()).toMatchObject({
      error: "Failed to fetch DSA topic summaries",
    });
  });
});
