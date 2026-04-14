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

  it("treats real-world problems as EASY regardless of difficulty", () => {
    expect(getDSAFreemiumBucket("HARD", true)).toBe("EASY");
    expect(getDSAFreemiumBucket("MEDIUM", true)).toBe("EASY");
    expect(getDSAFreemiumBucket(undefined, true)).toBe("EASY");
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
  it("has expected bucket sizes", () => {
    expect(DSA_FREEMIUM_LIMITS).toEqual({ EASY: 5, MEDIUM: 3, HARD: 1 });
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
    // 7 easy, 5 medium, 3 hard
    const questions = [
      makeQ("e1", "EASY"),
      makeQ("e2", "EASY"),
      makeQ("e3", "EASY"),
      makeQ("e4", "EASY"),
      makeQ("e5", "EASY"),
      makeQ("e6", "EASY"),
      makeQ("e7", "EASY"),
      makeQ("m1", "MEDIUM"),
      makeQ("m2", "MEDIUM"),
      makeQ("m3", "MEDIUM"),
      makeQ("m4", "MEDIUM"),
      makeQ("m5", "MEDIUM"),
      makeQ("h1", "HARD"),
      makeQ("h2", "HARD"),
      makeQ("h3", "HARD"),
    ];

    const result = applyDSAFreemiumGating(questions, getBucket);

    // All 15 questions returned — none removed
    expect(result).toHaveLength(15);

    // First 5 easy unlocked, 6th and 7th locked
    expect(
      result.filter((q) => q.id.startsWith("e") && !q.isLocked),
    ).toHaveLength(5);
    expect(
      result.filter((q) => q.id.startsWith("e") && q.isLocked),
    ).toHaveLength(2);

    // First 3 medium unlocked, 4th and 5th locked
    expect(
      result.filter((q) => q.id.startsWith("m") && !q.isLocked),
    ).toHaveLength(3);
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

  it("real-world problems count toward EASY bucket", () => {
    const questions = [
      makeQ("e1", "EASY"),
      makeQ("e2", "EASY"),
      makeQ("e3", "EASY"),
      makeQ("e4", "EASY"),
      makeQ("rw1", "HARD", true), // real-world → counts as EASY
      makeQ("e6", "EASY"), // this should be locked (6th in EASY bucket)
    ];

    const result = applyDSAFreemiumGating(questions, getBucket);

    // rw1 should be unlocked (5th in EASY bucket)
    expect(result.find((q) => q.id === "rw1")?.isLocked).toBe(false);
    // e6 should be locked (6th in EASY bucket)
    expect(result.find((q) => q.id === "e6")?.isLocked).toBe(true);
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
});
