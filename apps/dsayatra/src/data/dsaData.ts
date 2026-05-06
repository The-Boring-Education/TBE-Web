export type { DSADifficultyType } from "@tbe/constants";
export { DSA_DIFFICULTY } from "@tbe/constants";

export interface Question {
  title: string;
  leetcode_url: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface Topic {
  topic: string;
  emoji: string;
  questions: Question[];
}

export const DIFFICULTY_WEIGHTS = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
} as const;

export const sortQuestionsByDifficulty = (
  questions: Question[],
): Question[] => {
  return [...questions].sort((a, b) => {
    return DIFFICULTY_WEIGHTS[a.difficulty] - DIFFICULTY_WEIGHTS[b.difficulty];
  });
};

export { DSA_YATRA_FAQS } from "@tbe/constants";
