import { useDsaTopics } from "@tbe/hooks";
import type { DsaQuestion } from "@tbe/interface";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const mockQuestions: DsaQuestion[] = [
  {
    id: "q1",
    name: "Two Sum",
    difficultyLevel: "EASY",
    topics: ["ARRAY"],
    answer: "",
  },
  {
    id: "q2",
    name: "Three Sum",
    difficultyLevel: "MEDIUM",
    topics: ["ARRAY"],
    answer: "",
  },
  {
    id: "q3",
    name: "Valid Parentheses",
    difficultyLevel: "EASY",
    topics: ["STACK"],
    answer: "",
  },
  {
    id: "q4",
    name: "Binary Search",
    difficultyLevel: "EASY",
    topics: ["BINARY_SEARCH"],
    answer: "",
  },
  {
    id: "q5",
    name: "Merge Sort",
    difficultyLevel: "MEDIUM",
    topics: ["SORTING"],
    answer: "",
  },
];

describe("useDsaTopics", () => {
  it("should aggregate topics with counts", () => {
    const { result } = renderHook(() => useDsaTopics(mockQuestions));

    expect(result.current.topicsWithCounts.length).toBe(4);

    const arrayTopic = result.current.topicsWithCounts.find(
      (t) => t.topic === "ARRAY",
    );
    expect(arrayTopic?.count).toBe(2);
    expect(arrayTopic?.label).toBe("Arrays");

    const stackTopic = result.current.topicsWithCounts.find(
      (t) => t.topic === "STACK",
    );
    expect(stackTopic?.count).toBe(1);
  });

  it("should sort topics by TOPIC_LABELS priority order", () => {
    const { result } = renderHook(() => useDsaTopics(mockQuestions));

    const topicOrder = result.current.topicsWithCounts.map((t) => t.topic);

    const arrayIdx = topicOrder.indexOf("ARRAY");
    const binarySearchIdx = topicOrder.indexOf("BINARY_SEARCH");
    const sortingIdx = topicOrder.indexOf("SORTING");
    const stackIdx = topicOrder.indexOf("STACK");

    expect(arrayIdx).toBeLessThan(binarySearchIdx);
    expect(sortingIdx).toBeLessThan(stackIdx);
  });

  it("should return empty topicsCompletionMap when no completedIds", () => {
    const { result } = renderHook(() => useDsaTopics(mockQuestions));

    expect(result.current.topicsCompletionMap["ARRAY"]).toBe(false);
    expect(result.current.topicsCompletionMap["STACK"]).toBe(false);
  });

  it("should mark topic as completed when all its questions are completed", () => {
    const completedIds = ["q3"];

    const { result } = renderHook(() =>
      useDsaTopics(mockQuestions, completedIds),
    );

    expect(result.current.topicsCompletionMap["STACK"]).toBe(true);
    expect(result.current.topicsCompletionMap["ARRAY"]).toBe(false);
  });

  it("should not mark topic as completed when only some questions are completed", () => {
    const completedIds = ["q1"];

    const { result } = renderHook(() =>
      useDsaTopics(mockQuestions, completedIds),
    );

    expect(result.current.topicsCompletionMap["ARRAY"]).toBe(false);
  });

  it("should mark topic as completed when all questions in topic are completed", () => {
    const completedIds = ["q1", "q2"];

    const { result } = renderHook(() =>
      useDsaTopics(mockQuestions, completedIds),
    );

    expect(result.current.topicsCompletionMap["ARRAY"]).toBe(true);
  });

  it("should filter questions by topic", () => {
    const { result } = renderHook(() => useDsaTopics(mockQuestions));

    const arrayQuestions = result.current.getFilteredQuestions("ARRAY");
    expect(arrayQuestions.length).toBe(2);
    expect(arrayQuestions.every((q) => q.topics?.[0] === "ARRAY")).toBe(true);

    const stackQuestions = result.current.getFilteredQuestions("STACK");
    expect(stackQuestions.length).toBe(1);
  });

  it("should return empty array when filtering with null topic", () => {
    const { result } = renderHook(() => useDsaTopics(mockQuestions));

    const questions = result.current.getFilteredQuestions(null);
    expect(questions).toEqual([]);
  });

  it("should handle empty questions array", () => {
    const { result } = renderHook(() => useDsaTopics([]));

    expect(result.current.topicsWithCounts).toEqual([]);
    expect(result.current.topicsCompletionMap).toEqual({});
  });

  it("should handle questions with no topics", () => {
    const questionsWithNoTopics: DsaQuestion[] = [
      {
        id: "q1",
        name: "No Topic",
        difficultyLevel: "EASY",
        topics: [],
        answer: "",
      },
    ];

    const { result } = renderHook(() => useDsaTopics(questionsWithNoTopics));

    expect(result.current.topicsWithCounts).toEqual([]);
  });
});
