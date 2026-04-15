import { createHash } from "crypto";

type DifficultyBucketConfig<TDifficulty extends string> = Record<
  TDifficulty,
  number
>;

type DifficultyBucketSelectionOptions<
  TItem extends { _id: unknown },
  TDifficulty extends string,
> = {
  seed: string;
  buckets: DifficultyBucketConfig<TDifficulty>;
  difficultyOrder: readonly TDifficulty[];
  getDifficulty: (item: TItem) => TDifficulty | null;
  getPriorityScore?: (item: TItem) => number;
};

type DifficultyBucketSelectionResult<TItem, TDifficulty extends string> = {
  selected: TItem[];
  counts: Record<TDifficulty, number>;
};

const buildStableScore = (seed: string, value: string) => {
  const hash = createHash("sha256").update(`${seed}:${value}`).digest("hex");
  return Number.parseInt(hash.slice(0, 12), 16);
};

export const selectQuestionsByDifficultyBuckets = <
  TItem extends { _id: unknown },
  TDifficulty extends string,
>(
  items: TItem[],
  options: DifficultyBucketSelectionOptions<TItem, TDifficulty>,
): DifficultyBucketSelectionResult<TItem, TDifficulty> => {
  const bucketed = options.difficultyOrder.reduce(
    (acc, difficulty) => {
      acc[difficulty] = [];
      return acc;
    },
    {} as Record<TDifficulty, TItem[]>,
  );
  const counts = options.difficultyOrder.reduce(
    (acc, difficulty) => {
      acc[difficulty] = 0;
      return acc;
    },
    {} as Record<TDifficulty, number>,
  );
  const scoreCache = new Map<string, number>();
  const getPriorityScore = options.getPriorityScore ?? (() => 0);

  const getScore = (item: TItem) => {
    const id = String(item._id ?? "");
    const cached = scoreCache.get(id);
    if (cached !== undefined) return cached;
    const score = buildStableScore(options.seed, id);
    scoreCache.set(id, score);
    return score;
  };

  for (const item of items) {
    const difficulty = options.getDifficulty(item);
    if (!difficulty || !bucketed[difficulty]) continue;
    bucketed[difficulty].push(item);
  }

  const selected: TItem[] = [];

  for (const difficulty of options.difficultyOrder) {
    const limit = options.buckets[difficulty] ?? 0;
    if (limit <= 0) {
      counts[difficulty] = 0;
      continue;
    }

    const sorted = bucketed[difficulty].slice().sort((a, b) => {
      const priorityDiff = getPriorityScore(b) - getPriorityScore(a);
      if (priorityDiff !== 0) return priorityDiff;
      const scoreDiff = getScore(a) - getScore(b);
      if (scoreDiff !== 0) return scoreDiff;
      return String(a._id).localeCompare(String(b._id));
    });

    const chosen = sorted.slice(0, limit);
    counts[difficulty] = chosen.length;
    selected.push(...chosen);
  }

  return { selected, counts };
};
