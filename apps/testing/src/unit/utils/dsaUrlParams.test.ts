import type { DsaQuestion } from "@tbe/interface";
import {
  decodeDsaTopicFromUrl,
  encodeDsaQuestionTitleForUrl,
  encodeDsaTopicForUrl,
  findDsaQuestionByUrlSlug,
} from "@tbe/utils";
import { describe, expect, it } from "vitest";

describe("dsaUrlParams", () => {
  describe("encodeDsaTopicForUrl", () => {
    it("lowercases and converts underscores to hyphens", () => {
      expect(encodeDsaTopicForUrl("ARRAY")).toBe("array");
      expect(encodeDsaTopicForUrl("TWO_POINTERS")).toBe("two-pointers");
    });
  });

  describe("decodeDsaTopicFromUrl", () => {
    it("decodes canonical slug", () => {
      expect(decodeDsaTopicFromUrl("array")).toBe("ARRAY");
      expect(decodeDsaTopicFromUrl("two-pointers")).toBe("TWO_POINTERS");
    });
    it("accepts legacy uppercase keys", () => {
      expect(decodeDsaTopicFromUrl("ARRAY")).toBe("ARRAY");
    });
    it("accepts underscores as legacy", () => {
      expect(decodeDsaTopicFromUrl("two_pointers")).toBe("TWO_POINTERS");
    });
    it("returns null for empty or unknown", () => {
      expect(decodeDsaTopicFromUrl(undefined)).toBe(null);
      expect(decodeDsaTopicFromUrl("")).toBe(null);
      expect(decodeDsaTopicFromUrl("not-a-topic")).toBe(null);
    });
  });

  describe("encodeDsaQuestionTitleForUrl", () => {
    it("slugifies titles", () => {
      expect(encodeDsaQuestionTitleForUrl("Two Sum")).toBe("two-sum");
      expect(encodeDsaQuestionTitleForUrl("  Valid Parentheses ")).toBe(
        "valid-parentheses",
      );
    });
  });

  describe("findDsaQuestionByUrlSlug", () => {
    it("finds by slug", () => {
      const q = findDsaQuestionByUrlSlug(
        [
          { name: "Two Sum", difficultyLevel: "EASY" },
          { name: "Three Sum", difficultyLevel: "MEDIUM" },
        ] as DsaQuestion[],
        "two-sum",
      );
      expect(q?.name).toBe("Two Sum");
    });
  });
});
