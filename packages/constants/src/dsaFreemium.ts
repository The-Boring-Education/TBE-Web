export type DSAFreemiumBucket = "EASY" | "MEDIUM" | "HARD";

export const DSA_FREEMIUM_LIMITS: Record<DSAFreemiumBucket, number> = {
  EASY: 5,
  MEDIUM: 3,
  HARD: 1,
};

interface DSAFreemiumBucketInput {
  difficulty?: string | null;
  isRealWorldProblem?: boolean | null;
}

export const getDSAFreemiumBucket = ({
  difficulty,
  isRealWorldProblem,
}: DSAFreemiumBucketInput): DSAFreemiumBucket | undefined => {
  if (isRealWorldProblem) return "EASY";

  const normalizedDifficulty = difficulty?.toUpperCase();
  if (
    normalizedDifficulty === "EASY" ||
    normalizedDifficulty === "MEDIUM" ||
    normalizedDifficulty === "HARD"
  ) {
    return normalizedDifficulty;
  }

  return undefined;
};

export const selectDSAFreemiumQuestions = <T>(
  questions: readonly T[],
  getBucketInput: (question: T) => DSAFreemiumBucketInput,
): T[] => {
  const bucketed: Record<DSAFreemiumBucket, T[]> = {
    EASY: [],
    MEDIUM: [],
    HARD: [],
  };

  for (const question of questions) {
    const bucket = getDSAFreemiumBucket(getBucketInput(question));
    if (!bucket) continue;
    bucketed[bucket].push(question);
  }

  return [
    ...bucketed.EASY.slice(0, DSA_FREEMIUM_LIMITS.EASY),
    ...bucketed.MEDIUM.slice(0, DSA_FREEMIUM_LIMITS.MEDIUM),
    ...bucketed.HARD.slice(0, DSA_FREEMIUM_LIMITS.HARD),
  ];
};
