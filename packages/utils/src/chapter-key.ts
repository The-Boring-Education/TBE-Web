/**
 * Chapter Key — a human-authored, kebab-case identity for a course chapter.
 *
 * Learner progress references the embedded chapter's storage id, so anything
 * that rebuilds the `chapters` array detaches completions. The key is the only
 * identity that survives an offline edit, a pull request diff or a regeneration,
 * which is why it is required, unique within its course and never derived again
 * once assigned.
 */

/** Kebab-case: lowercase alphanumeric groups separated by single hyphens. */
export const CHAPTER_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Keys are capped so derived values stay readable in diffs and URLs. */
export const CHAPTER_KEY_MAX_LENGTH = 80;

/** True when `value` is a non-empty kebab-case chapter key within the length cap. */
export function isValidChapterKey(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= CHAPTER_KEY_MAX_LENGTH &&
    CHAPTER_KEY_PATTERN.test(value)
  );
}

/**
 * Normalizes a human-typed key (trim + lowercase) without validating it.
 * Returns an empty string for non-string input.
 */
export function normalizeChapterKey(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/** Fallback used when a title has no kebab-case-able characters at all. */
export const FALLBACK_CHAPTER_KEY = "chapter";

/** Derives a kebab-case key from a chapter title. Always returns a valid key. */
export function deriveChapterKey(title: string | undefined | null): string {
  const derived = (title ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, CHAPTER_KEY_MAX_LENGTH)
    .replace(/-+$/g, "");

  return derived || FALLBACK_CHAPTER_KEY;
}

/**
 * Resolves a collision deterministically by appending `-2`, `-3`, … until the
 * key is free. Suffixes respect the length cap by trimming the base key.
 */
export function resolveChapterKeyCollision(
  baseKey: string,
  isTaken: (key: string) => boolean,
): string {
  if (!isTaken(baseKey)) return baseKey;

  for (let suffix = 2; ; suffix++) {
    const tail = `-${suffix}`;
    const base = baseKey
      .slice(0, CHAPTER_KEY_MAX_LENGTH - tail.length)
      .replace(/-+$/g, "");
    const candidate = `${base || FALLBACK_CHAPTER_KEY}${tail}`;
    if (!isTaken(candidate)) return candidate;
  }
}

/**
 * Assigns keys to a course's chapters in order: existing valid keys are kept,
 * missing or malformed ones are derived from the title and de-duplicated
 * deterministically against every key already taken in the same course.
 */
export function assignChapterKeys(
  chapters: ReadonlyArray<{ name?: string | null; key?: unknown }>,
): string[] {
  const taken = new Set<string>();
  const keys: string[] = [];

  for (const chapter of chapters) {
    const existing = normalizeChapterKey(chapter?.key);
    const base = isValidChapterKey(existing)
      ? existing
      : deriveChapterKey(chapter?.name);
    const key = resolveChapterKeyCollision(base, (candidate) =>
      taken.has(candidate),
    );

    taken.add(key);
    keys.push(key);
  }

  return keys;
}
