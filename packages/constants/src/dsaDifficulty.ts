export type DSADifficultyType = "EASY" | "MEDIUM" | "HARD";

export const DSA_DIFFICULTY: DSADifficultyType[] = ["EASY", "MEDIUM", "HARD"];

/** Per-duration caps for how many questions to pull at each difficulty (sheet generation). */
export const DSA_DURATION_DIFFICULTY_BUCKETS: Record<
  string,
  Record<DSADifficultyType, number>
> = {
  "1Month": {
    EASY: 4,
    MEDIUM: 2,
    HARD: 1,
  },
  "3Months": {
    EASY: 8,
    MEDIUM: 4,
    HARD: 2,
  },
  "6Months": {
    EASY: 12,
    MEDIUM: 6,
    HARD: 3,
  },
  "1Year": {
    EASY: 16,
    MEDIUM: 8,
    HARD: 4,
  },
};
