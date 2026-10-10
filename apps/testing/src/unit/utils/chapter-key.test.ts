/**
 * Chapter Key helpers (`@tbe/utils`): derivation, validation and deterministic
 * collision resolution used by both chapter creation and the backfill.
 */
import {
  assignChapterKeys,
  CHAPTER_KEY_MAX_LENGTH,
  deriveChapterKey,
  isValidChapterKey,
  normalizeChapterKey,
  resolveChapterKeyCollision,
} from "@tbe/utils";
import { describe, expect, it } from "vitest";

describe("isValidChapterKey", () => {
  it("accepts kebab-case keys", () => {
    expect(isValidChapterKey("intro")).toBe(true);
    expect(isValidChapterKey("intro-to-react-18")).toBe(true);
  });

  it("rejects malformed keys", () => {
    for (const key of [
      "",
      " ",
      "Intro",
      "intro_to_react",
      "intro to react",
      "-intro",
      "intro-",
      "intro--react",
      "intro/react",
      "a".repeat(CHAPTER_KEY_MAX_LENGTH + 1),
    ]) {
      expect(isValidChapterKey(key)).toBe(false);
    }
  });

  it("rejects non-string values", () => {
    expect(isValidChapterKey(undefined)).toBe(false);
    expect(isValidChapterKey(null)).toBe(false);
    expect(isValidChapterKey(42)).toBe(false);
  });
});

describe("normalizeChapterKey", () => {
  it("trims and lowercases", () => {
    expect(normalizeChapterKey("  Intro-To-React  ")).toBe("intro-to-react");
  });

  it("returns an empty string for non-strings", () => {
    expect(normalizeChapterKey(undefined)).toBe("");
  });
});

describe("deriveChapterKey", () => {
  it("kebab-cases a title", () => {
    expect(deriveChapterKey("Intro to React!")).toBe("intro-to-react");
    expect(deriveChapterKey("  State & Props  ")).toBe("state-props");
  });

  it("strips diacritics", () => {
    expect(deriveChapterKey("Introducción")).toBe("introduccion");
  });

  it("falls back when a title has nothing kebab-case-able", () => {
    expect(deriveChapterKey("***")).toBe("chapter");
    expect(deriveChapterKey("")).toBe("chapter");
    expect(deriveChapterKey(null)).toBe("chapter");
  });

  it("always produces a valid key", () => {
    expect(isValidChapterKey(deriveChapterKey("A".repeat(200)))).toBe(true);
  });
});

describe("resolveChapterKeyCollision", () => {
  it("keeps the base key when it is free", () => {
    expect(resolveChapterKeyCollision("intro", () => false)).toBe("intro");
  });

  it("appends numeric suffixes deterministically", () => {
    const taken = new Set(["intro", "intro-2"]);
    expect(resolveChapterKeyCollision("intro", (k) => taken.has(k))).toBe(
      "intro-3",
    );
  });
});

describe("assignChapterKeys", () => {
  it("derives keys from titles and de-duplicates within the course", () => {
    expect(
      assignChapterKeys([
        { name: "Intro" },
        { name: "Intro" },
        { name: "Intro" },
      ]),
    ).toEqual(["intro", "intro-2", "intro-3"]);
  });

  it("keeps valid existing keys and only fills the gaps", () => {
    expect(
      assignChapterKeys([
        { name: "Welcome", key: "intro" },
        { name: "Intro" },
        { name: "Deep dive", key: "Deep-Dive" },
      ]),
    ).toEqual(["intro", "intro-2", "deep-dive"]);
  });

  it("replaces malformed keys with derived ones", () => {
    expect(
      assignChapterKeys([{ name: "Hooks 101", key: "Hooks 101" }]),
    ).toEqual(["hooks-101"]);
  });

  it("leaves no chapter without a key and is idempotent", () => {
    const chapters = [{ name: "***" }, { name: "***" }, { name: "Testing" }];
    const first = assignChapterKeys(chapters);
    expect(first).toEqual(["chapter", "chapter-2", "testing"]);
    expect(first.every(isValidChapterKey)).toBe(true);

    const withKeys = chapters.map((chapter, index) => ({
      ...chapter,
      key: first[index],
    }));
    expect(assignChapterKeys(withKeys)).toEqual(first);
  });
});
