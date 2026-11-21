import { describe, expect, it } from "vitest";

import {
  generateStarterCode,
  outputsMatch,
  runCodeAgainstTestCases,
  toMethodName,
} from "../../../../../packages/components/src/containers/Cards/dsa-code-editor";

describe("DSA Code Editor Core Utilities", () => {
  describe("toMethodName", () => {
    it("converts multi-word problem titles to camelCase method names", () => {
      expect(toMethodName("Two Sum")).toBe("twoSum");
      expect(toMethodName("Reverse Linked List")).toBe("reverseLinkedList");
      expect(
        toMethodName("Longest Substring Without Repeating Characters"),
      ).toBe("longestSubstringWithoutRepeatingCharacters");
    });

    it("handles single-word titles or punctuation safely", () => {
      expect(toMethodName("Sort Colors")).toBe("sortColors");
      expect(toMethodName("3Sum")).toBe("3sum");
      expect(toMethodName("")).toBe("solve");
    });
  });

  describe("generateStarterCode", () => {
    it("generates Python starter code with class Solution and method", () => {
      const code = generateStarterCode("python", "Two Sum");
      expect(code).toContain("class Solution:");
      expect(code).toContain("def twoSum(self, *args):");
      expect(code).toContain('if __name__ == "__main__":');
    });

    it("generates Java starter code with Solution class and main method", () => {
      const code = generateStarterCode("java", "Two Sum");
      expect(code).toContain("public class Solution");
      expect(code).toContain("public void twoSum()");
      expect(code).toContain("public static void main(String[] args)");
    });

    it("generates C++ starter code with includes and Solution class", () => {
      const code = generateStarterCode("cpp", "Two Sum");
      expect(code).toContain("#include <iostream>");
      expect(code).toContain("class Solution");
      expect(code).toContain("void twoSum()");
    });

    it("generates JavaScript starter function", () => {
      const code = generateStarterCode("javascript", "Two Sum");
      expect(code).toContain("function twoSum(...args)");
    });
  });

  describe("normalizeOutput & outputsMatch", () => {
    it("matches exact strings and ignores trailing whitespace/newlines", () => {
      expect(outputsMatch("42\n", "42")).toBe(true);
      expect(outputsMatch(" hello world \r\n", "hello world")).toBe(true);
    });

    it("matches array variations with different spacing", () => {
      expect(outputsMatch("[0, 1]", "[0,1]")).toBe(true);
      expect(outputsMatch("[1, 2, 3]", "[1,2,3]")).toBe(true);
      expect(outputsMatch("true", "True")).toBe(true);
    });

    it("returns false for different values", () => {
      expect(outputsMatch("[0, 2]", "[0, 1]")).toBe(false);
      expect(outputsMatch("false", "true")).toBe(false);
    });
  });

  describe("runCodeAgainstTestCases (execution & evaluation)", () => {
    it("correctly evaluates passing test cases for simulated/client code", async () => {
      const testCases = [
        {
          id: "tc-1",
          label: "Case 1",
          input: "2, 3",
          expectedOutput: "5",
        },
      ];

      const jsCode = "console.log(5);";
      const result = await runCodeAgainstTestCases({
        language: "javascript",
        code: jsCode,
        testCases,
      });

      expect(result.totalCases).toBe(1);
      expect(result.results[0]?.passed).toBe(true);
      expect(result.results[0]?.actualOutput).toBe("5");
    });

    it("flags wrong output when actual output differs from expected output", async () => {
      const testCases = [
        {
          id: "tc-1",
          label: "Case 1",
          input: "2, 3",
          expectedOutput: "5",
        },
      ];

      const jsCode = "console.log(10);";
      const result = await runCodeAgainstTestCases({
        language: "javascript",
        code: jsCode,
        testCases,
      });

      expect(result.success).toBe(false);
      expect(result.results[0]?.passed).toBe(false);
      expect(result.results[0]?.actualOutput).toBe("10");
      expect(result.results[0]?.expectedOutput).toBe("5");
    });
  });
});
