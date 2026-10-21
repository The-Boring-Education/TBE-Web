import type React from 'react';

import type { QuizTabId } from './QuizLayout';
import { QuizLayout } from './QuizLayout';

interface QuizzesNavProps {
  activeTab?: QuizTabId;
}

/**
 * @deprecated Use `QuizLayout` to wrap quiz page content directly with sidebar & bottom navigation.
 */
export const QuizzesNav: React.FC<QuizzesNavProps> = () => {
  // Return null because navigation is now rendered via QuizLayout
  return null;
};

export { QuizLayout };
export type { QuizTabId };
