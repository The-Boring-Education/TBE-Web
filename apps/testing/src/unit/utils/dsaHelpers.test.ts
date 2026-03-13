import {
  extractConstraints,
  extractExamples,
  transformDsaQuestion,
} from "@tbe/utils";
import { describe, expect, it } from "vitest";

describe("DSA Helpers", () => {
  describe("transformDsaQuestion", () => {
    it("should transform API question to DsaQuestion format", () => {
      const apiQuestion = {
        _id: "q123",
        title: "Two Sum",
        difficulty: "EASY",
        answer: "Use a hash map to find complement.",
        resources: {
          leetcodeURL: "https://leetcode.com/problems/two-sum",
          youtubeURL: "https://youtube.com/watch?v=abc",
        },
        topics: ["ARRAY", "HASHMAP"],
        companyTypes: ["Google", "Meta"],
        domain: ["DSA"],
      };

      const result = transformDsaQuestion(apiQuestion);

      expect(result.id).toBe("q123");
      expect(result.name).toBe("Two Sum");
      expect(result.difficultyLevel).toBe("EASY");
      expect(result.resources?.leetcodeURL).toBe(
        "https://leetcode.com/problems/two-sum",
      );
      expect(result.resources?.youtubeURL).toBe(
        "https://youtube.com/watch?v=abc",
      );
      expect(result.topics).toEqual(["ARRAY", "HASHMAP"]);
      expect(result.companyType).toEqual(["Google", "Meta"]);
      expect(result.domain).toEqual(["DSA"]);
    });

    it("should strip title from answer text", () => {
      const apiQuestion = {
        _id: "q1",
        title: "Reverse Array",
        difficulty: "EASY",
        answer: "# Reverse Array\nSwap elements from both ends.",
        topics: [],
      };

      const result = transformDsaQuestion(apiQuestion);

      expect(result.answer).not.toContain("Reverse Array");
      expect(result.answer).toContain("Swap elements");
    });

    it("should generate YouTube URL when not provided", () => {
      const apiQuestion = {
        _id: "q2",
        title: "Binary Search",
        difficulty: "MEDIUM",
        answer: "Divide and conquer.",
        resources: {},
        topics: [],
      };

      const result = transformDsaQuestion(apiQuestion);

      expect(result.resources?.youtubeURL).toContain("youtube.com");
      expect(result.resources?.youtubeURL).toContain("Binary");
    });

    it("should handle missing answer gracefully", () => {
      const apiQuestion = {
        _id: "q3",
        title: "Empty Question",
        difficulty: "HARD",
        topics: [],
      };

      const result = transformDsaQuestion(apiQuestion);

      expect(result.answer).toBe("");
      expect(result.examples).toEqual([]);
      expect(result.constraints).toEqual([]);
    });

    it("should handle null resources gracefully", () => {
      const apiQuestion = {
        _id: "q4",
        title: "No Resources",
        difficulty: "EASY",
        answer: "Some answer",
        resources: null,
        topics: [],
      };

      const result = transformDsaQuestion(apiQuestion);

      expect(result.resources?.youtubeURL).toContain("youtube.com");
    });

    it("should strip examples and constraints from answer body", () => {
      const apiQuestion = {
        _id: "q5",
        title: "Test",
        difficulty: "MEDIUM",
        answer:
          "Main answer text.\n\nExample 1:\nInput: [1,2]\nOutput: 3\n\nConstraints:\n- 1 <= n <= 100",
        topics: [],
      };

      const result = transformDsaQuestion(apiQuestion);

      expect(result.answer).not.toContain("Example 1:");
      expect(result.answer).not.toContain("Constraints:");
      expect(result.answer).toContain("Main answer text.");
    });
  });

  describe("extractExamples", () => {
    it("should extract examples from markdown", () => {
      const markdown =
        "Some text\n\nExample 1:\nInput: nums = [1,2,3]\nOutput: 6\nExplanation: Sum of all elements\n\nExample 2:\nInput: nums = []\nOutput: 0";

      const examples = extractExamples(markdown);

      expect(examples.length).toBe(2);
      expect(examples[0].inputText).toContain("[1,2,3]");
      expect(examples[0].outputText).toContain("6");
      expect(examples[0].explanation).toContain("Sum");
    });

    it("should return empty array when no examples found", () => {
      const result = extractExamples("No examples here.");
      expect(result).toEqual([]);
    });

    it("should return empty array for empty string", () => {
      const result = extractExamples("");
      expect(result).toEqual([]);
    });
  });

  describe("extractConstraints", () => {
    it("should extract constraints from markdown", () => {
      const markdown =
        "Some text\n\nConstraints:\n- 1 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9";

      const constraints = extractConstraints(markdown);

      expect(constraints.length).toBeGreaterThanOrEqual(2);
      const joined = constraints.join(" ");
      expect(joined).toContain("nums.length");
      expect(joined).toContain("nums[i]");
    });

    it("should return empty array when text has no matching section", () => {
      const result = extractConstraints(
        "Just some plain text about algorithms.",
      );
      expect(result).toEqual([]);
    });

    it("should return empty array for empty string", () => {
      const result = extractConstraints("");
      expect(result).toEqual([]);
    });

    it("should handle bullet-point constraints", () => {
      const markdown = "Some text\n\nConstraints:\n* n >= 1\n* m <= 100";
      const result = extractConstraints(markdown);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
      const found = result.some(
        (c: string) => c.includes("n >= 1") || c.includes("m <= 100"),
      );
      expect(found).toBe(true);
    });
  });
});
