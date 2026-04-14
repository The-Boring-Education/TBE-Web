import {
  DSA_FREEMIUM_LIMITS,
  getDSAFreemiumBucket,
  selectDSAFreemiumQuestions,
} from "@tbe/constants";
import { describe, expect, it } from "vitest";

describe("dsa freemium selection", () => {
  it("should expose expected freemium limits", () => {
    expect(DSA_FREEMIUM_LIMITS).toEqual({
      EASY: 5,
      MEDIUM: 3,
      HARD: 1,
    });
  });

  it("should classify real-world questions as EASY", () => {
    const bucket = getDSAFreemiumBucket({
      difficulty: "HARD",
      isRealWorldProblem: true,
    });

    expect(bucket).toBe("EASY");
  });

  it("should classify difficulty case-insensitively", () => {
    expect(getDSAFreemiumBucket({ difficulty: "easy" })).toBe("EASY");
    expect(getDSAFreemiumBucket({ difficulty: "Medium" })).toBe("MEDIUM");
    expect(getDSAFreemiumBucket({ difficulty: "HARD" })).toBe("HARD");
  });

  it("should return undefined for unsupported difficulties", () => {
    expect(getDSAFreemiumBucket({ difficulty: "VERY_HARD" })).toBeUndefined();
  });

  it("should pick 5 EASY (including real-world), then 3 MEDIUM, then 1 HARD", () => {
    const questions = [
      { id: "e1", difficulty: "easy", isRealWorldProblem: false },
      { id: "h1", difficulty: "hard", isRealWorldProblem: false },
      { id: "rw1", difficulty: "hard", isRealWorldProblem: true },
      { id: "e2", difficulty: "easy", isRealWorldProblem: false },
      { id: "m1", difficulty: "medium", isRealWorldProblem: false },
      { id: "m2", difficulty: "medium", isRealWorldProblem: false },
      { id: "e3", difficulty: "easy", isRealWorldProblem: false },
      { id: "m3", difficulty: "medium", isRealWorldProblem: false },
      { id: "e4", difficulty: "easy", isRealWorldProblem: false },
      { id: "e5", difficulty: "easy", isRealWorldProblem: false },
      { id: "m4", difficulty: "medium", isRealWorldProblem: false },
      { id: "h2", difficulty: "hard", isRealWorldProblem: false },
    ];

    const selected = selectDSAFreemiumQuestions(questions, (question) => ({
      difficulty: question.difficulty,
      isRealWorldProblem: question.isRealWorldProblem,
    }));

    expect(selected.map((question) => question.id)).toEqual([
      "e1",
      "rw1",
      "e2",
      "e3",
      "e4",
      "m1",
      "m2",
      "m3",
      "h1",
    ]);
  });

  it("should gracefully return fewer rows when buckets are missing", () => {
    const questions = [
      { id: "e1", difficulty: "easy", isRealWorldProblem: false },
      { id: "e2", difficulty: "easy", isRealWorldProblem: false },
    ];

    const selected = selectDSAFreemiumQuestions(questions, (question) => ({
      difficulty: question.difficulty,
      isRealWorldProblem: question.isRealWorldProblem,
    }));

    expect(selected.map((question) => question.id)).toEqual(["e1", "e2"]);
  });
});
