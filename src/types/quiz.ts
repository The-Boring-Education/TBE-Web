export interface Question {
  id: number | string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  detailedExplanation: string;
  category: string;
  difficulty: string;
}

export interface QuizCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  questions: Question[];
  color: string;
}

export interface QuizState {
  currentQuestion: number;
  answers: (number | null)[];
  timeLeft: number;
  isActive: boolean;
  isCompleted: boolean;
  startTime: number;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  timeTaken: number;
  answers: (number | null)[];
}