export interface ResourceMeta {
  title: string;
  description: string;
  keywords?: string[];
  /** Absolute URL for Open Graph / Twitter */
  ogImage?: string;
  tags?: string[];
}

export interface ResourceIndexEntry {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  tags: string[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number; // index of the correct option
}

export interface ResourceQuiz {
  title: string;
  description: string;
  questions: QuizQuestion[];
}
