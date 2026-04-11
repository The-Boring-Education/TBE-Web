/** Sort order for standard three-band difficulty (extend maps for custom bands). */
export const STANDARD_DIFFICULTY_ORDER: Readonly<Record<string, number>> = {
  EASY: 0,
  MEDIUM: 1,
  HARD: 2,
};

export type DifficultyGroupLabel = {
  label: string;
  color: string;
};

/** Default labels for EASY / MEDIUM / HARD group headers */
export const STANDARD_DIFFICULTY_LABELS: Readonly<
  Record<string, DifficultyGroupLabel>
> = {
  EASY: { label: "Easy", color: "text-green-400" },
  MEDIUM: { label: "Medium", color: "text-orange-400" },
  HARD: { label: "Hard", color: "text-red-400" },
};

/**
 * Default expanded state for standard three-band sidebars (DSA Yatra, on-campus prep, etc.).
 */
export const STANDARD_DIFFICULTY_GROUPS_DEFAULT_EXPANDED: Readonly<
  Record<string, boolean>
> = {
  EASY: true,
  MEDIUM: true,
  HARD: true,
};

/**
 * Map interview-sheet priority (High / Medium / Low) to the same band keys used for DSA difficulty grouping.
 */
export function mapInterviewPriorityToDifficultyGroup(
  priority: string | undefined | null,
): string {
  const p = String(priority ?? "Medium")
    .trim()
    .toUpperCase();
  if (p === "HIGH") return "HARD";
  if (p === "LOW") return "EASY";
  return "MEDIUM";
}

const UNKNOWN_GROUP_RANK = 999;

/**
 * Normalize arbitrary difficulty strings (e.g. from API or CMS) to an uppercase bucket key.
 */
export function normalizeDifficultyGroupKey(
  raw: string | undefined | null,
  fallback: string = "MEDIUM",
): string {
  if (raw == null || String(raw).trim() === "") return fallback;
  return String(raw).trim().toUpperCase();
}

/**
 * Group items by a normalized difficulty key. Unknown / empty values use `fallbackGroup`.
 */
export function groupItemsByDifficulty<T>(
  items: readonly T[],
  getDifficulty: (item: T) => string | undefined,
  fallbackGroup: string = "MEDIUM",
): Record<string, T[]> {
  return items.reduce(
    (acc, item) => {
      const key = normalizeDifficultyGroupKey(
        getDifficulty(item),
        fallbackGroup,
      );
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, T[]>,
  );
}

function groupRank(
  key: string,
  orderMap: Readonly<Record<string, number>>,
): number {
  return orderMap[key] ?? UNKNOWN_GROUP_RANK;
}

/**
 * Sort group entries so known difficulties follow `orderMap`; unknown keys sort last.
 */
export function getSortedDifficultyGroupEntries<T>(
  grouped: Readonly<Record<string, T[]>>,
  orderMap: Readonly<Record<string, number>> = STANDARD_DIFFICULTY_ORDER,
): [string, T[]][] {
  return Object.entries(grouped).sort(
    ([a], [b]) => groupRank(a, orderMap) - groupRank(b, orderMap),
  );
}

export function getDifficultyGroupLabel(
  groupKey: string,
  labels: Readonly<
    Record<string, DifficultyGroupLabel>
  > = STANDARD_DIFFICULTY_LABELS,
): DifficultyGroupLabel {
  return (
    labels[groupKey] ?? {
      label: groupKey,
      color: "text-gray-400",
    }
  );
}
