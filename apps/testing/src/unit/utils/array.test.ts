import { pickRandomSubset, shuffleArray } from "@tbe/utils/array";
import { describe, expect, it, vi } from "vitest";

describe("array utilities", () => {
  describe("shuffleArray", () => {
    it("returns a new array with the same length", () => {
      const input = [1, 2, 3, 4, 5];
      const result = shuffleArray(input);

      expect(result).not.toBe(input);
      expect(result).toHaveLength(input.length);
      expect(result.sort()).toEqual(input.sort());
    });

    it("returns empty array for empty input", () => {
      expect(shuffleArray([])).toEqual([]);
    });

    it("does not mutate the input array", () => {
      const input = ["a", "b", "c"];
      const copy = [...input];
      shuffleArray(input);
      expect(input).toEqual(copy);
    });

    it("can reorder elements", () => {
      vi.spyOn(Math, "random").mockReturnValue(0);
      const result = shuffleArray([1, 2, 3, 4]);
      expect(result).not.toEqual([1, 2, 3, 4]);
      vi.restoreAllMocks();
    });
  });

  describe("pickRandomSubset", () => {
    it("returns at most count items", () => {
      const pool = [1, 2, 3, 4, 5, 6, 7, 8];
      const result = pickRandomSubset(pool, 3);
      expect(result).toHaveLength(3);
    });

    it("caps count at pool length", () => {
      const pool = [1, 2];
      const result = pickRandomSubset(pool, 10);
      expect(result).toHaveLength(2);
      expect(result.sort()).toEqual([1, 2]);
    });

    it("returns empty array when pool is empty", () => {
      expect(pickRandomSubset([], 5)).toEqual([]);
    });
  });
});
