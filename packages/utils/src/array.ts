/** Fisher–Yates shuffle; returns a new array without mutating the input. */
export const shuffleArray = <T>(array: readonly T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = current;
  }
  return shuffled;
};

/** Shuffles `items` and returns up to `count` elements (capped at pool size). */
export const pickRandomSubset = <T>(
  items: readonly T[],
  count: number,
): T[] => {
  const limit = Math.min(count, items.length);
  return shuffleArray(items).slice(0, limit);
};
