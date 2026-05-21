import { PATTERN_QUIZ_QUESTIONS } from "@tbe/constants";
import type {
  PatternQuizAnswer,
  PatternQuizQuestion,
  PatternQuizResult,
  PatternQuizState,
} from "@tbe/types";
import { pickRandomSubset } from "@tbe/utils/array";
import { useCallback, useMemo, useState } from "react";

const buildPatternQuizResult = (
  questions: PatternQuizQuestion[],
  selectedAnswers: Map<string, number>,
): PatternQuizResult => {
  const answers: PatternQuizAnswer[] = questions.map((question) => {
    const selected = selectedAnswers.get(question.id) ?? -1;
    return {
      questionId: question.id,
      selectedAnswer: selected,
      isCorrect: selected === question.correctAnswer,
    };
  });

  const totalQuestions = questions.length;
  const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const score =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    score,
    answers,
  };
};

const usePatternQuiz = (questionsPerRound = 5) => {
  const [quizState, setQuizState] = useState<PatternQuizState>("idle");
  const [questions, setQuestions] = useState<PatternQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, number>>(
    () => new Map(),
  );
  const [result, setResult] = useState<PatternQuizResult | null>(null);

  const totalQuestions = questions.length;
  const lastIndex = Math.max(totalQuestions - 1, 0);

  const currentQuestion = useMemo(
    () => questions.at(currentIndex) ?? null,
    [questions, currentIndex],
  );

  const startQuiz = useCallback(() => {
    setQuestions(pickRandomSubset(PATTERN_QUIZ_QUESTIONS, questionsPerRound));
    setCurrentIndex(0);
    setSelectedAnswers(new Map());
    setResult(null);
    setQuizState("in-progress");
  }, [questionsPerRound]);

  const selectAnswer = useCallback(
    (questionId: string, answerIndex: number) => {
      setSelectedAnswers((prev) => {
        const next = new Map(prev);
        next.set(questionId, answerIndex);
        return next;
      });
    },
    [],
  );

  const nextQuestion = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, lastIndex));
  }, [lastIndex]);

  const prevQuestion = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const submitQuiz = useCallback(() => {
    setResult(buildPatternQuizResult(questions, selectedAnswers));
    setQuizState("completed");
  }, [questions, selectedAnswers]);

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
