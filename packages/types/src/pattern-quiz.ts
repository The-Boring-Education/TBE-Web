export interface PatternQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
}

export type PatternQuizState = "idle" | "in-progress" | "completed";

export interface PatternQuizResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  answers: PatternQuizAnswer[];
}

export interface PatternQuizAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}
