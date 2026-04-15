export type DSAFreemiumBucket = "EASY" | "MEDIUM" | "HARD" | "REAL_WORLD";

/**
 * How many questions each difficulty bucket allows for free-tier users.
 * Questions within the limit are unlocked; the rest are locked.
 *
 * Free users get: 3 Easy, 2 Medium, 1 Hard, 1 Real World problem.
 */
export const DSA_FREEMIUM_LIMITS: Record<DSAFreemiumBucket, number> = {
  EASY: 3,
  MEDIUM: 2,
  HARD: 1,
  REAL_WORLD: 1,
};

/**
 * Map a question's difficulty (+ real-world flag) to a freemium bucket.
 * Real-world problems get their own dedicated bucket (REAL_WORLD).
 */
export const getDSAFreemiumBucket = (
  difficulty: string | undefined | null,
  isRealWorldProblem?: boolean,
): DSAFreemiumBucket | undefined => {
  if (isRealWorldProblem) return "REAL_WORLD";

  const normalized = difficulty?.toUpperCase();
  if (normalized === "EASY" || normalized === "MEDIUM" || normalized === "HARD")
    return normalized;

  return undefined;
};

/**
 * Given a flat list of questions, mark each one as `isLocked` based on
 * per-difficulty freemium caps. Unlocked questions keep all their data;
 * locked questions are stripped to title + metadata only (by the caller).
 *
 * Returns an **ordered** array with every question annotated.
 */
export const applyDSAFreemiumGating = <T extends { isLocked?: boolean }>(
  questions: readonly T[],
  getBucket: (q: T) => DSAFreemiumBucket | undefined,
): (T & { isLocked: boolean })[] => {
  const seen: Record<DSAFreemiumBucket, number> = {
    EASY: 0,
    MEDIUM: 0,
    HARD: 0,
    REAL_WORLD: 0,
  };

  return questions.map((q) => {
    const bucket = getBucket(q);

    if (!bucket) {
      // Unknown difficulty → unlocked (don't gate what we can't classify)
      return { ...q, isLocked: false };
    }

    const limit = DSA_FREEMIUM_LIMITS[bucket];
    const isLocked = seen[bucket] >= limit;
    seen[bucket] += 1;

    return { ...q, isLocked };
  });
};
