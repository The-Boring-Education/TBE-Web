/**
 * Unit tests for the pure DSA sheet helpers that back `getAllDSAQuestionsFromDB`.
 * These helpers are side-effect free; they are tested without a database.
 */
import { describe, expect, it } from "vitest";

import {
  applyDsaDurationBuckets,
  applyDsaFreemiumGate,
  applyDsaPaidPagination,
  buildDsaBucketSeed,
  buildDsaMatchStage,
  DSA_TOPIC_SORT_ORDER,
  getEffectiveBucketCaps,
  paginateDsaRows,
  stripInternalDsaFields,
  stripLockedAnswerFields,
} from "@/lib/database/queries/dsaSheet";

// ── stripInternalDsaFields ───────────────────────────────────────────────────

describe("stripInternalDsaFields", () => {
  it("removes internal aggregation fields without touching user data", () => {
    const input = {
      _id: "q1",
      title: "Two Sum",
      difficulty: "EASY",
      _topicOrder: 3,
      _difficultyOrder: 1,
      _priorityScore: 1,
      _topicLimit: 5,
      userStatus: { isCompleted: false },
    };

    const output = stripInternalDsaFields(input);

    expect(output).toEqual({
      _id: "q1",
      title: "Two Sum",
      difficulty: "EASY",
    });
  });

  it("returns a shallow copy (does not mutate input)", () => {
    const input: Record<string, unknown> = {
      _id: "q1",
      _topicOrder: 1,
    };
    const output = stripInternalDsaFields(input);
    expect(input).toHaveProperty("_topicOrder");
    expect(output).not.toHaveProperty("_topicOrder");
  });
});

// ── stripLockedAnswerFields ──────────────────────────────────────────────────

describe("stripLockedAnswerFields", () => {
  it("strips answer/sections/resources/notes when isLocked=true", () => {
    const locked = {
      _id: "q1",
      title: "Two Sum",
      isLocked: true,
      answer: "...",
      sections: [{}],
      resources: { leetcode: "url" },
      notes: "private",
    };
    const output = stripLockedAnswerFields(locked);
    expect(output).toEqual({
      _id: "q1",
      title: "Two Sum",
      isLocked: true,
    });
  });

  it("returns input unchanged when isLocked is false", () => {
    const unlocked = { _id: "q1", isLocked: false, answer: "keep me" };
    expect(stripLockedAnswerFields(unlocked)).toBe(unlocked);
  });

  it("returns input unchanged when isLocked is undefined", () => {
    const q = { _id: "q1", answer: "keep me" };
    expect(stripLockedAnswerFields(q)).toBe(q);
  });
});

// ── buildDsaMatchStage ───────────────────────────────────────────────────────

describe("buildDsaMatchStage", () => {
  it("returns empty match when no filters or target companies", () => {
    expect(buildDsaMatchStage({}, [])).toEqual({});
  });

  it("wraps scalar filters in $in arrays", () => {
    const match = buildDsaMatchStage(
      { difficulty: "EASY", topics: "ARRAY" },
      [],
    );
    expect(match.difficulty).toEqual({ $in: ["EASY"] });
    expect(match.topics).toEqual({ $in: ["ARRAY"] });
  });

  it("keeps array filters as-is", () => {
    const match = buildDsaMatchStage(
      { difficulty: ["EASY", "MEDIUM"] as any },
      [],
    );
    expect(match.difficulty).toEqual({ $in: ["EASY", "MEDIUM"] });
  });

  it("handles realWorld=only as isRealWorldProblem:true", () => {
    expect(buildDsaMatchStage({ realWorld: "only" }, [])).toEqual({
      isRealWorldProblem: true,
    });
  });

  it("handles realWorld=exclude as isRealWorldProblem:$ne true", () => {
    expect(buildDsaMatchStage({ realWorld: "exclude" }, [])).toEqual({
      isRealWorldProblem: { $ne: true },
    });
  });

  it("intersects explicit companyTypes with user's target companies", () => {
    const match = buildDsaMatchStage(
      { userId: "u1", companyTypes: ["FAANG", "MNC"] },
      ["FAANG", "Startup"],
    );
    // Intersection = ["FAANG"]
    expect(match.companyTypes).toEqual({ $in: ["FAANG"] });
  });

  it("falls back to target companies when intersection is empty", () => {
    const match = buildDsaMatchStage(
      { userId: "u1", companyTypes: ["FAANG"] },
      ["Startup"],
    );
    expect(match.companyTypes).toEqual({ $in: ["Startup"] });
  });

  it("sets companyTypes from target companies when filter is absent", () => {
    const match = buildDsaMatchStage({ userId: "u1" }, ["MNC", "FAANG"]);
    expect(match.companyTypes).toEqual({ $in: ["MNC", "FAANG"] });
  });

  it("does not set companyTypes when userId is absent", () => {
    const match = buildDsaMatchStage({}, ["MNC"]);
    expect(match.companyTypes).toBeUndefined();
  });
});

// ── DSA_TOPIC_SORT_ORDER ─────────────────────────────────────────────────────

describe("DSA_TOPIC_SORT_ORDER", () => {
  it("starts with ARRAY, STRING, HASHMAP (fundamentals first)", () => {
    expect(DSA_TOPIC_SORT_ORDER.slice(0, 3)).toEqual([
      "ARRAY",
      "STRING",
      "HASHMAP",
    ]);
  });

  it("ends with advanced topics (DP, GREEDY, UNION_FIND)", () => {
    const tail = DSA_TOPIC_SORT_ORDER.slice(-3);
    expect(tail).toContain("DYNAMIC_PROGRAMMING");
    expect(tail).toContain("UNION_FIND");
  });
});

// ── buildDsaBucketSeed ───────────────────────────────────────────────────────

describe("buildDsaBucketSeed", () => {
  it("includes userId, duration, offCampus, realWorld in the seed", () => {
    const seed = buildDsaBucketSeed({
      userId: "u1",
      duration: "3Months",
      offCampus: true,
      realWorld: "include",
    });
    expect(seed).toContain("u1");
    expect(seed).toContain("3Months");
    expect(seed).toContain("off-campus");
    expect(seed).toContain("include");
  });

  it("uses __no_user__ placeholder when userId is absent", () => {
    const seed = buildDsaBucketSeed({ duration: "1Year" });
    expect(seed).toContain("__no_user__");
  });

  it("is deterministic for the same inputs", () => {
    const input = { userId: "u1", duration: "3Months", offCampus: false };
    expect(buildDsaBucketSeed(input)).toBe(buildDsaBucketSeed(input));
  });

  it("differs when offCampus toggles", () => {
    const base = { userId: "u1", duration: "3Months" };
    expect(buildDsaBucketSeed({ ...base, offCampus: false })).not.toBe(
      buildDsaBucketSeed({ ...base, offCampus: true }),
    );
  });

  it("normalizes array filter values (uppercase + sorted)", () => {
    const a = buildDsaBucketSeed({ topics: ["array", "string"] });
    const b = buildDsaBucketSeed({ topics: ["STRING", "ARRAY"] });
    expect(a).toBe(b);
  });
});

// ── getEffectiveBucketCaps ──────────────────────────────────────────────────

describe("getEffectiveBucketCaps", () => {
  it("returns null for unknown or missing duration", () => {
    expect(getEffectiveBucketCaps(undefined, undefined, false)).toBeNull();
    expect(getEffectiveBucketCaps("9Months", undefined, false)).toBeNull();
  });

  it("returns base caps for on-campus (offCampus=false) with default experience", () => {
    const caps = getEffectiveBucketCaps("1Month", undefined, false)!;
    // 1Month total=3, fresher: easy=1, medium=1, hard=1
    expect(caps.EASY + caps.MEDIUM + caps.HARD).toBe(3);
  });

  it("scales caps by 1.5× (ceil) for off-campus", () => {
    const caps = getEffectiveBucketCaps("3Months", undefined, true)!;
    const base = getEffectiveBucketCaps("3Months", undefined, false)!;
    expect(caps.EASY).toBe(Math.ceil(base.EASY * 1.5));
    expect(caps.MEDIUM).toBe(Math.ceil(base.MEDIUM * 1.5));
    expect(caps.HARD).toBe(Math.ceil(base.HARD * 1.5));
  });

  it("produces different ratios for different experience levels", () => {
    const fresher = getEffectiveBucketCaps(
      "6Months",
      "Fresher (0-1 yr)",
      false,
    )!;
    const senior = getEffectiveBucketCaps("6Months", "Senior (5+ yrs)", false)!;
    // Same total, different distribution
    expect(fresher.EASY + fresher.MEDIUM + fresher.HARD).toBe(
      senior.EASY + senior.MEDIUM + senior.HARD,
    );
    expect(fresher.EASY).toBeGreaterThan(senior.EASY);
    expect(senior.HARD).toBeGreaterThan(fresher.HARD);
  });
});

// ── paginateDsaRows ──────────────────────────────────────────────────────────

describe("paginateDsaRows", () => {
  const makeRows = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ _id: String(i + 1) }));

  it("returns the first page slice with correct pagination shape", () => {
    const rows = makeRows(25);
    const result = paginateDsaRows(rows, 1, 10);
    expect(result.items).toHaveLength(10);
    expect(result.items[0]._id).toBe("1");
    expect(result.pagination).toEqual({
      total: 25,
      page: 1,
      limit: 10,
      totalPages: 3,
      hasMore: true,
    });
  });

  it("paginates to the middle and final pages", () => {
    const rows = makeRows(25);
    expect(paginateDsaRows(rows, 2, 10).items[0]._id).toBe("11");
    expect(paginateDsaRows(rows, 3, 10).items).toHaveLength(5);
    expect(paginateDsaRows(rows, 3, 10).pagination.hasMore).toBe(false);
  });

  it("accepts a totalOverride independent of rows.length", () => {
    const rows = makeRows(10);
    const result = paginateDsaRows(rows, 1, 10, 100);
    expect(result.pagination.total).toBe(100);
    expect(result.pagination.totalPages).toBe(10);
    expect(result.pagination.hasMore).toBe(true);
  });

  it("returns empty items + hasMore=false when page is beyond data", () => {
    const rows = makeRows(5);
    const result = paginateDsaRows(rows, 5, 10);
    expect(result.items).toHaveLength(0);
    expect(result.pagination.hasMore).toBe(false);
  });
});

// ── applyDsaFreemiumGate ─────────────────────────────────────────────────────

describe("applyDsaFreemiumGate", () => {
  const makeQ = (
    id: string,
    difficulty: string,
    extras: Record<string, unknown> = {},
  ) => ({
    _id: id,
    title: `Q-${id}`,
    difficulty,
    answer: `Answer-${id}`,
    sections: [{ label: "s" }],
    resources: { leetcode: "url" },
    notes: "private",
    _topicOrder: 0,
    _difficultyOrder: 0,
    _priorityScore: 0,
    ...extras,
  });

  it("gates per-difficulty caps: 3E/2M/1H + 1 real-world", () => {
    const rows = [
      ...Array.from({ length: 5 }, (_, i) => makeQ(`e${i}`, "EASY")),
      ...Array.from({ length: 4 }, (_, i) => makeQ(`m${i}`, "MEDIUM")),
      ...Array.from({ length: 3 }, (_, i) => makeQ(`h${i}`, "HARD")),
      makeQ("rw0", "MEDIUM", { isRealWorldProblem: true }),
      makeQ("rw1", "MEDIUM", { isRealWorldProblem: true }),
    ];
    const result = applyDsaFreemiumGate(rows, 1, 100);

    expect(result.isFreemiumUser).toBe(true);
    expect(result.pagination.total).toBe(14);

    const unlocked = (result.questions as any[]).filter((q) => !q.isLocked);
    // 3 easy + 2 medium + 1 hard + 1 real-world = 7
    expect(unlocked).toHaveLength(7);
  });

  it("strips answer/sections/resources/notes for locked rows", () => {
    const rows = [
      makeQ("e1", "EASY"),
      makeQ("e2", "EASY"),
      makeQ("e3", "EASY"),
      makeQ("e4", "EASY"), // locked
    ];
    const result = applyDsaFreemiumGate(rows, 1, 100);
    const locked = (result.questions as any[]).find((q) => q.isLocked);
    expect(locked).toBeDefined();
    expect(locked).not.toHaveProperty("answer");
    expect(locked).not.toHaveProperty("sections");
    expect(locked).not.toHaveProperty("resources");
    expect(locked).not.toHaveProperty("notes");
    // Title + basic metadata still present
    expect(locked.title).toBe("Q-e4");
    expect(locked.difficulty).toBe("EASY");
  });

  it("keeps answer fields for unlocked rows", () => {
    const rows = [makeQ("e1", "EASY")];
    const result = applyDsaFreemiumGate(rows, 1, 100);
    const unlocked = (result.questions as any[])[0];
    expect(unlocked.isLocked).toBe(false);
    expect(unlocked.answer).toBe("Answer-e1");
  });

  it("strips internal aggregation fields from all rows", () => {
    const rows = [makeQ("e1", "EASY"), makeQ("e4", "EASY", { _topicOrder: 5 })];
    const result = applyDsaFreemiumGate(rows, 1, 100);
    for (const q of result.questions as any[]) {
      expect(q).not.toHaveProperty("_topicOrder");
      expect(q).not.toHaveProperty("_difficultyOrder");
      expect(q).not.toHaveProperty("_priorityScore");
    }
  });
});

// ── applyDsaDurationBuckets ──────────────────────────────────────────────────

describe("applyDsaDurationBuckets", () => {
  const makeQ = (id: string, difficulty: string, priority = 0) => ({
    _id: id,
    title: `Q-${id}`,
    difficulty,
    _priorityScore: priority,
    _topicOrder: 0,
    _difficultyOrder: 0,
  });

  it("caps per-difficulty according to duration and experience (1Month fresher: 1E/1M/1H)", () => {
    const rows = [
      ...Array.from({ length: 10 }, (_, i) => makeQ(`e${i}`, "EASY")),
      ...Array.from({ length: 10 }, (_, i) => makeQ(`m${i}`, "MEDIUM")),
      ...Array.from({ length: 10 }, (_, i) => makeQ(`h${i}`, "HARD")),
    ];

    const result = applyDsaDurationBuckets(
      rows,
      { duration: "1Month", offCampus: false, userId: "u1" },
      1,
      100,
    );

    const byDifficulty = (result.questions as any[]).reduce<
      Record<string, number>
    >((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {});

    expect(byDifficulty.EASY).toBe(1);
    expect(byDifficulty.MEDIUM).toBe(1);
    expect(byDifficulty.HARD).toBe(1);
  });

  it("scales caps by 1.5× when offCampus=true (3Months fresher: 5E/2M/2H)", () => {
    const rows = [
      ...Array.from({ length: 20 }, (_, i) => makeQ(`e${i}`, "EASY")),
      ...Array.from({ length: 20 }, (_, i) => makeQ(`m${i}`, "MEDIUM")),
      ...Array.from({ length: 20 }, (_, i) => makeQ(`h${i}`, "HARD")),
    ];

    const result = applyDsaDurationBuckets(
      rows,
      { duration: "3Months", offCampus: true, userId: "u1" },
      1,
      100,
    );

    const byDifficulty = (result.questions as any[]).reduce<
      Record<string, number>
    >((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {});

    expect(byDifficulty.EASY).toBe(5);
    expect(byDifficulty.MEDIUM).toBe(2);
    expect(byDifficulty.HARD).toBe(2);
  });

  it("prioritizes higher _priorityScore rows within each bucket", () => {
    const rows = [
      makeQ("low1", "EASY", 0),
      makeQ("high1", "EASY", 1),
      makeQ("low2", "EASY", 0),
      makeQ("high2", "EASY", 1),
      makeQ("low3", "EASY", 0),
      makeQ("high3", "EASY", 1),
      makeQ("low4", "EASY", 0),
    ];

    // 6Months fresher offCampus=false → EASY cap=4 (floor(8*0.6)=4)
    const result = applyDsaDurationBuckets(
      rows,
      { duration: "6Months", offCampus: false, userId: "u1" },
      1,
      100,
    );

    const picked = (result.questions as any[]).map((q) => q._id);
    expect(picked).toContain("high1");
    expect(picked).toContain("high2");
    expect(picked).toContain("high3");
    expect(picked).toHaveLength(4);
  });

  it("falls back to plain pagination when duration is not a known key", () => {
    const rows = Array.from({ length: 15 }, (_, i) => makeQ(String(i), "EASY"));

    const result = applyDsaDurationBuckets(
      rows,
      { duration: "unknown-key", userId: "u1" },
      1,
      10,
    );

    expect(result.questions).toHaveLength(10);
    expect(result.pagination.total).toBe(15);
  });

  it("is deterministic across calls for the same filters", () => {
    const rows = Array.from({ length: 20 }, (_, i) =>
      makeQ(`q${i}`, "EASY", 0),
    );
    const filters = {
      duration: "1Month",
      offCampus: false,
      userId: "u1",
    };

    const first = applyDsaDurationBuckets(rows, filters, 1, 100);
    const second = applyDsaDurationBuckets(rows, filters, 1, 100);

    expect((first.questions as any[]).map((q) => q._id)).toEqual(
      (second.questions as any[]).map((q) => q._id),
    );
  });
});

// ── applyDsaPaidPagination ───────────────────────────────────────────────────

describe("applyDsaPaidPagination", () => {
  const makeQ = (id: string) => ({
    _id: id,
    title: `Q-${id}`,
    _topicOrder: 1,
    _priorityScore: 0,
  });

  it("uses the provided totalCount (not rows.length) for pagination", () => {
    const rows = [makeQ("1"), makeQ("2")];
    const result = applyDsaPaidPagination(rows, 1, 10, 500);
    expect(result.pagination.total).toBe(500);
    expect(result.pagination.totalPages).toBe(50);
    expect(result.pagination.hasMore).toBe(true);
  });

  it("strips internal aggregation fields from returned questions", () => {
    const rows = [makeQ("1")];
    const result = applyDsaPaidPagination(rows, 1, 10, 1);
    const q = (result.questions as any[])[0];
    expect(q).not.toHaveProperty("_topicOrder");
    expect(q).not.toHaveProperty("_priorityScore");
    expect(q.title).toBe("Q-1");
  });
});
