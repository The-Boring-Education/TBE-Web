export type DSADifficultyType = "EASY" | "MEDIUM" | "HARD";

export const DSA_DIFFICULTY: DSADifficultyType[] = ["EASY", "MEDIUM", "HARD"];

/**
 * Per-topic question caps based on Timeline × Experience.
 *
 * How it works:
 * - Timeline decides TOTAL questions per topic.
 * - Experience shifts the DIFFICULTY RATIO within that total.
 *
 * Freshers  → mostly Easy, some Medium, very few Hard
 * Junior    → balanced Easy+Medium, some Hard
 * Mid       → more Medium+Hard, fewer Easy
 * Senior    → mostly Medium+Hard
 */

export type DSAExperienceKey = "fresher" | "junior" | "mid" | "senior";

/** Total questions per topic for each timeline */
export const DSA_TIMELINE_TOPIC_CAPS: Record<string, number> = {
  "1Month": 3,
  "3Months": 5,
  "6Months": 8,
  "1Year": 12,
};

/** Difficulty distribution ratios per experience level (must sum to 1.0) */
export const DSA_EXPERIENCE_RATIOS: Record<
  DSAExperienceKey,
  Record<DSADifficultyType, number>
> = {
  fresher: { EASY: 0.6, MEDIUM: 0.3, HARD: 0.1 },
  junior: { EASY: 0.4, MEDIUM: 0.4, HARD: 0.2 },
  mid: { EASY: 0.2, MEDIUM: 0.5, HARD: 0.3 },
  senior: { EASY: 0.1, MEDIUM: 0.4, HARD: 0.5 },
};

/**
 * Compute per-difficulty caps from timeline + experience.
 * Guarantees the sum equals the timeline total exactly.
 */
export const getDsaBucketCaps = (
  timeline: string,
  experience: DSAExperienceKey = "fresher",
): Record<DSADifficultyType, number> | null => {
  const total = DSA_TIMELINE_TOPIC_CAPS[timeline];
  if (!total) return null;

  const ratios = DSA_EXPERIENCE_RATIOS[experience];

  // Allocate proportionally, rounding down first
  let easy = Math.floor(total * ratios.EASY);
  let medium = Math.floor(total * ratios.MEDIUM);
  let hard = total - easy - medium; // remainder goes to hard

  // Ensure at least 1 per bucket if total >= 3
  if (total >= 3) {
    if (easy < 1) {
      easy = 1;
      hard--;
    }
    if (medium < 1) {
      medium = 1;
      hard--;
    }
    if (hard < 1) {
      hard = 1;
      easy--;
    }
  }

  return { EASY: easy, MEDIUM: medium, HARD: hard };
};

/** @deprecated Use getDsaBucketCaps() instead. Kept for backward compat. */
export const DSA_DURATION_DIFFICULTY_BUCKETS: Record<
  string,
  Record<DSADifficultyType, number>
> = {
  "1Month": { EASY: 2, MEDIUM: 1, HARD: 0 },
  "3Months": { EASY: 3, MEDIUM: 2, HARD: 0 },
  "6Months": { EASY: 4, MEDIUM: 3, HARD: 1 },
  "1Year": { EASY: 5, MEDIUM: 4, HARD: 3 },
};
