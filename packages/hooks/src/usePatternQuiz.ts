import { useCallback, useMemo, useState } from "react";

import { PATTERN_QUIZ_QUESTIONS } from "@tbe/constants";
import type {
  PatternQuizAnswer,
  PatternQuizQuestion,
  PatternQuizResult,
  PatternQuizState,
} from "@tbe/types";

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const usePatternQuiz = (questionsPerRound = 5) => {
  const [quizState, setQuizState] = useState<PatternQuizState>("idle");
  const [questions, setQuestions] = useState<PatternQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, number>>(
    new Map(),
  );
  const [result, setResult] = useState<PatternQuizResult | null>(null);

  const currentQuestion = useMemo(
    () => questions[currentIndex] || null,
    [questions, currentIndex],
  );

  const totalQuestions = questions.length;

  const startQuiz = useCallback(() => {
    const selected = shuffleArray(PATTERN_QUIZ_QUESTIONS).slice(
      0,
      questionsPerRound,
    );
    setQuestions(selected);
    setCurrentIndex(0);
    setSelectedAnswers(new Map());
    setResult(null);
    setQuizState("in-progress");
  }, [questionsPerRound]);

  const selectAnswer = useCallback(
    (questionId: string, answerIndex: number) => {
      setSelectedAnswers((prev) => {
        const updated = new Map(prev);
        updated.set(questionId, answerIndex);
        return updated;
      });
    },
    [],
  );

  const nextQuestion = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
  }, [totalQuestions]);

  const prevQuestion = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const submitQuiz = useCallback(() => {
    const answers: PatternQuizAnswer[] = questions.map((q) => {
      const selected = selectedAnswers.get(q.id) ?? -1;
      return {
        questionId: q.id,
        selectedAnswer: selected,
        isCorrect: selected === q.correctAnswer,
      };
    });

    const correctAnswers = answers.filter((a) => a.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const score =
      totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    const quizResult: PatternQuizResult = {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      score,
      answers,
    };

    setResult(quizResult);
    setQuizState("completed");
  }, [questions, selectedAnswers, totalQuestions]);

  const resetQuiz = useCallback(() => {
    setQuizState("idle");
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswers(new Map());
    setResult(null);
  }, []);

  return {
    currentQuestion,
    currentIndex,
    totalQuestions,
    selectedAnswers,
    quizState,
    result,
    questions,
    startQuiz,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    submitQuiz,
    resetQuiz,
  };
};

export default usePatternQuiz;
