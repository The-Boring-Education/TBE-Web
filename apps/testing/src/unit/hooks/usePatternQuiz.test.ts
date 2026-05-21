import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tbe/constants", () => ({
  PATTERN_QUIZ_QUESTIONS: [
    {
      id: "q1",
      question: "Question 1",
      options: ["A", "B", "C", "D"],
      correctAnswer: 1,
      explanation: "Explanation 1",
      difficulty: "easy",
      topic: "Two Pointers",
    },
    {
      id: "q2",
      question: "Question 2",
      options: ["A", "B", "C", "D"],
      correctAnswer: 2,
      explanation: "Explanation 2",
      difficulty: "medium",
      topic: "Sliding Window",
    },
    {
      id: "q3",
      question: "Question 3",
      options: ["A", "B", "C", "D"],
      correctAnswer: 0,
      explanation: "Explanation 3",
      difficulty: "hard",
      topic: "Binary Search",
    },
    {
      id: "q4",
      question: "Question 4",
      options: ["A", "B", "C", "D"],
      correctAnswer: 3,
      explanation: "Explanation 4",
      difficulty: "easy",
      topic: "BFS/DFS",
    },
    {
      id: "q5",
      question: "Question 5",
      options: ["A", "B", "C", "D"],
      correctAnswer: 1,
      explanation: "Explanation 5",
      difficulty: "medium",
      topic: "Dynamic Programming",
    },
  ],
}));

import usePatternQuiz from "@tbe/hooks/usePatternQuiz";

describe("usePatternQuiz", () => {
  it("initializes with idle state", () => {
    const { result } = renderHook(() => usePatternQuiz());

    expect(result.current.quizState).toBe("idle");
    expect(result.current.currentQuestion).toBeNull();
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.totalQuestions).toBe(0);
    expect(result.current.result).toBeNull();
  });

  it("starts quiz and selects questions", () => {
    const { result } = renderHook(() => usePatternQuiz(3));

    act(() => {
      result.current.startQuiz();
    });

    expect(result.current.quizState).toBe("in-progress");
    expect(result.current.totalQuestions).toBe(3);
    expect(result.current.currentQuestion).not.toBeNull();
    expect(result.current.currentIndex).toBe(0);
  });

  it("navigates between questions", () => {
    const { result } = renderHook(() => usePatternQuiz(3));

    act(() => {
      result.current.startQuiz();
    });

    act(() => {
      result.current.nextQuestion();
    });

    expect(result.current.currentIndex).toBe(1);

    act(() => {
      result.current.prevQuestion();
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it("does not navigate past boundaries", () => {
    const { result } = renderHook(() => usePatternQuiz(3));

    act(() => {
      result.current.startQuiz();
    });

    act(() => {
      result.current.prevQuestion();
    });

    expect(result.current.currentIndex).toBe(0);

    act(() => {
      result.current.nextQuestion();
      result.current.nextQuestion();
      result.current.nextQuestion();
    });

    expect(result.current.currentIndex).toBe(2);
  });

  it("selects answers for questions", () => {
    const { result } = renderHook(() => usePatternQuiz(3));

    act(() => {
      result.current.startQuiz();
    });

    const questionId = result.current.currentQuestion!.id;

    act(() => {
      result.current.selectAnswer(questionId, 2);
    });

    expect(result.current.selectedAnswers.get(questionId)).toBe(2);
  });

  it("submits quiz and calculates results", () => {
    const { result } = renderHook(() => usePatternQuiz(5));

    act(() => {
      result.current.startQuiz();
    });

    // Answer all questions with the correct answer
    const questions = result.current.questions;
    for (const q of questions) {
      act(() => {
        result.current.selectAnswer(q.id, q.correctAnswer);
      });
    }

    act(() => {
      result.current.submitQuiz();
    });

    expect(result.current.quizState).toBe("completed");
    expect(result.current.result).not.toBeNull();
    expect(result.current.result!.score).toBe(100);
    expect(result.current.result!.correctAnswers).toBe(5);
    expect(result.current.result!.incorrectAnswers).toBe(0);
  });

  it("calculates partial score correctly", () => {
    const { result } = renderHook(() => usePatternQuiz(5));

    act(() => {
      result.current.startQuiz();
    });

    const questions = result.current.questions;
    // Answer only the first two correctly, rest wrong
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      act(() => {
        result.current.selectAnswer(
          q.id,
          i < 2 ? q.correctAnswer : (q.correctAnswer + 1) % 4,
        );
      });
    }

    act(() => {
      result.current.submitQuiz();
    });

    expect(result.current.result!.correctAnswers).toBe(2);
    expect(result.current.result!.incorrectAnswers).toBe(3);
    expect(result.current.result!.score).toBe(40);
  });

  it("resets quiz to idle state", () => {
    const { result } = renderHook(() => usePatternQuiz(3));

    act(() => {
      result.current.startQuiz();
    });

    act(() => {
      result.current.resetQuiz();
    });

    expect(result.current.quizState).toBe("idle");
    expect(result.current.currentQuestion).toBeNull();
    expect(result.current.totalQuestions).toBe(0);
    expect(result.current.result).toBeNull();
  });

  it("handles unanswered questions as incorrect", () => {
    const { result } = renderHook(() => usePatternQuiz(5));

    act(() => {
      result.current.startQuiz();
    });

    // Don't answer any questions
    act(() => {
      result.current.submitQuiz();
    });

    expect(result.current.result!.correctAnswers).toBe(0);
    expect(result.current.result!.score).toBe(0);
  });
});
