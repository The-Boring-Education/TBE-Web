import {
  applyDSAFreemiumGating,
  DSA_FREEMIUM_LIMITS,
  getDSAFreemiumBucket,
} from "@tbe/constants";
import { describe, expect, it } from "vitest";

// ── getDSAFreemiumBucket ───────────────────────────────────────────────────

describe("getDSAFreemiumBucket", () => {
  it("maps EASY/MEDIUM/HARD case-insensitively", () => {
    expect(getDSAFreemiumBucket("easy")).toBe("EASY");
    expect(getDSAFreemiumBucket("Medium")).toBe("MEDIUM");
    expect(getDSAFreemiumBucket("HARD")).toBe("HARD");
  });

  it("treats real-world problems as REAL_WORLD bucket (separate from EASY)", () => {
    expect(getDSAFreemiumBucket("HARD", true)).toBe("REAL_WORLD");
    expect(getDSAFreemiumBucket("MEDIUM", true)).toBe("REAL_WORLD");
    expect(getDSAFreemiumBucket("EASY", true)).toBe("REAL_WORLD");
    expect(getDSAFreemiumBucket(undefined, true)).toBe("REAL_WORLD");
  });

  it("returns undefined for unknown difficulties", () => {
    expect(getDSAFreemiumBucket("EXPERT")).toBeUndefined();
    expect(getDSAFreemiumBucket("")).toBeUndefined();
    expect(getDSAFreemiumBucket(null)).toBeUndefined();
    expect(getDSAFreemiumBucket(undefined)).toBeUndefined();
  });
});

// ── DSA_FREEMIUM_LIMITS ────────────────────────────────────────────────────

describe("DSA_FREEMIUM_LIMITS", () => {
  it("has expected bucket sizes: 3 Easy, 2 Medium, 1 Hard, 1 Real World", () => {
    expect(DSA_FREEMIUM_LIMITS).toEqual({
      EASY: 3,
      MEDIUM: 2,
      HARD: 1,
      REAL_WORLD: 1,
    });
  });
});

// ── applyDSAFreemiumGating ─────────────────────────────────────────────────

describe("applyDSAFreemiumGating", () => {
  const makeQ = (
    id: string,
    difficulty: string,
    isRealWorldProblem = false,
  ) => ({
    id,
    difficulty,
    isRealWorldProblem,
    title: `Q-${id}`,
    answer: `Answer for ${id}`,
  });

  const getBucket = (q: ReturnType<typeof makeQ>) =>
    getDSAFreemiumBucket(q.difficulty, q.isRealWorldProblem);

  it("unlocks first N questions per bucket and locks the rest", () => {
    // 5 easy, 4 medium, 3 hard
    const questions = [
      makeQ("e1", "EASY"),
      makeQ("e2", "EASY"),
      makeQ("e3", "EASY"),
      makeQ("e4", "EASY"),
      makeQ("e5", "EASY"),
      makeQ("m1", "MEDIUM"),
      makeQ("m2", "MEDIUM"),
      makeQ("m3", "MEDIUM"),
      makeQ("m4", "MEDIUM"),
      makeQ("h1", "HARD"),
      makeQ("h2", "HARD"),
      makeQ("h3", "HARD"),
    ];

    const result = applyDSAFreemiumGating(questions, getBucket);

    // All 12 questions returned — none removed
    expect(result).toHaveLength(12);

    // First 3 easy unlocked, 4th and 5th locked
    expect(
      result.filter((q) => q.id.startsWith("e") && !q.isLocked),
    ).toHaveLength(3);
    expect(
      result.filter((q) => q.id.startsWith("e") && q.isLocked),
    ).toHaveLength(2);

    // First 2 medium unlocked, 3rd and 4th locked
    expect(
      result.filter((q) => q.id.startsWith("m") && !q.isLocked),
    ).toHaveLength(2);
    expect(
      result.filter((q) => q.id.startsWith("m") && q.isLocked),
    ).toHaveLength(2);

    // First 1 hard unlocked, 2nd and 3rd locked
    expect(
      result.filter((q) => q.id.startsWith("h") && !q.isLocked),
    ).toHaveLength(1);
    expect(
      result.filter((q) => q.id.startsWith("h") && q.isLocked),
    ).toHaveLength(2);
  });

  it("preserves original order", () => {
    const questions = [
      makeQ("e1", "EASY"),
      makeQ("h1", "HARD"),
      makeQ("m1", "MEDIUM"),
      makeQ("e2", "EASY"),
    ];

    const result = applyDSAFreemiumGating(questions, getBucket);
    expect(result.map((q) => q.id)).toEqual(["e1", "h1", "m1", "e2"]);
  });

  it("real-world problems count toward their own REAL_WORLD bucket", () => {
    const questions = [
      makeQ("rw1", "HARD", true), // real-world → 1st in REAL_WORLD bucket: unlocked
      makeQ("rw2", "EASY", true), // real-world → 2nd in REAL_WORLD bucket: locked
      makeQ("e1", "EASY"), // 1st in EASY bucket: unlocked
      makeQ("e2", "EASY"), // 2nd in EASY bucket: unlocked
      makeQ("e3", "EASY"), // 3rd in EASY bucket: unlocked
      makeQ("e4", "EASY"), // 4th in EASY bucket: locked
    ];

    const result = applyDSAFreemiumGating(questions, getBucket);

    // rw1 should be unlocked (1st REAL_WORLD)
    expect(result.find((q) => q.id === "rw1")?.isLocked).toBe(false);
    // rw2 should be locked (2nd REAL_WORLD, limit is 1)
    expect(result.find((q) => q.id === "rw2")?.isLocked).toBe(true);
    // e1, e2, e3 should be unlocked (within EASY limit of 3)
    expect(result.find((q) => q.id === "e1")?.isLocked).toBe(false);
    expect(result.find((q) => q.id === "e2")?.isLocked).toBe(false);
    expect(result.find((q) => q.id === "e3")?.isLocked).toBe(false);
    // e4 should be locked (4th in EASY bucket, limit is 3)
    expect(result.find((q) => q.id === "e4")?.isLocked).toBe(true);
  });

  it("handles empty input", () => {
    const result = applyDSAFreemiumGating([], getBucket);
    expect(result).toEqual([]);
  });

  it("unlocks questions with unknown difficulty", () => {
    const questions = [makeQ("x1", "EXPERT")];
    const result = applyDSAFreemiumGating(questions, getBucket);
    expect(result[0].isLocked).toBe(false);
  });

  it("handles fewer questions than limit per bucket", () => {
    const questions = [makeQ("e1", "EASY"), makeQ("m1", "MEDIUM")];
    const result = applyDSAFreemiumGating(questions, getBucket);
    expect(result.every((q) => !q.isLocked)).toBe(true);
  });

  it("annotates every question with isLocked boolean", () => {
    const questions = [makeQ("e1", "EASY")];
    const result = applyDSAFreemiumGating(questions, getBucket);
    expect(typeof result[0].isLocked).toBe("boolean");
  });

  it("enforces exact total: 3E + 2M + 1H + 1RW = 7 unlocked in mixed set", () => {
    const questions = [
      ...Array.from({ length: 5 }, (_, i) => makeQ(`e${i}`, "EASY")),
      ...Array.from({ length: 4 }, (_, i) => makeQ(`m${i}`, "MEDIUM")),
      ...Array.from({ length: 3 }, (_, i) => makeQ(`h${i}`, "HARD")),
      ...Array.from({ length: 3 }, (_, i) => makeQ(`rw${i}`, "EASY", true)),
    ];

    const result = applyDSAFreemiumGating(questions, getBucket);
    const unlocked = result.filter((q) => !q.isLocked);
    const locked = result.filter((q) => q.isLocked);

    // 3 easy + 2 medium + 1 hard + 1 real-world = 7 unlocked
    expect(unlocked.length).toBe(7);
    // 2 easy + 2 medium + 2 hard + 2 real-world = 8 locked
    expect(locked.length).toBe(8);
  });
});
