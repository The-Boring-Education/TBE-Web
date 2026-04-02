/**
 * Tracks which DSA question IDs have already triggered a gamification award
 * in this browser. Prevents duplicate API points when a user un-marks and
 * re-marks a question (the backend does not dedupe by question).
 */
export const DSA_GAMIFICATION_AWARDED_KEY =
  "dsayatra_gamification_awarded_questions";

export function parseAwardedIdsFromStorageValue(
  raw: string | null,
): Set<string> {
  if (raw == null || raw === "") return new Set();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map(String));
  } catch {
    return new Set();
  }
}

export function serializeAwardedIds(ids: Set<string>): string {
  return JSON.stringify([...ids]);
}

export function readAwardedQuestionIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  return parseAwardedIdsFromStorageValue(
    localStorage.getItem(DSA_GAMIFICATION_AWARDED_KEY),
  );
}

export function persistAwardedQuestionId(questionId: string): void {
  if (typeof window === "undefined") return;
  const set = readAwardedQuestionIds();
  if (set.has(questionId)) return;
  set.add(questionId);
  localStorage.setItem(DSA_GAMIFICATION_AWARDED_KEY, serializeAwardedIds(set));
}
