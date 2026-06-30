// Enhanced Quiz System Types

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Quiz Session Types
export interface QuizSessionData {
  sessionId: string;
  userId: string;
  quizId: string;
  categoryName: string;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  questionCount: number;
  currentQuestionIndex: number;
  currentQuestion: QuizQuestion | null;
  questions: string[]; // Array of question IDs
  answers: QuizAnswer[];
  status: "active" | "completed" | "abandoned";
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  timeSpent?: number;
  progress: {
    answered: number;
    total: number;
    percentage: number;
  };
}

export interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
  detailedExplanation: string;
  categoryName: string;
  topic: string;
}

export interface QuizAnswer {
  questionId: string;
  questionIndex: number;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  answeredAt: Date;
}

// User Performance Types
export interface UserQuestionPerformance {
  _id: string;
  userId: string;
  questionId: string;
  categoryName: string;
  totalAttempts: number;
  correctAttempts: number;
  averageTimeSpent: number;
  lastAttemptedAt: Date;

  // Spaced Repetition Algorithm fields
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;

  // Performance tracking
  streak: number;
  bestTime: number;
  difficulty: "easy" | "medium" | "hard";
}

// Analytics Types
export interface UserAnalytics {
  _id: string;
  userId: string;
  categoryName?: string;

  // Overall Performance
  totalQuizzesTaken: number;
  totalQuestionsAnswered: number;
  overallAccuracy: number;
  averageScore: number;
  bestScore: number;
  timeSpentTotal: number;
  averageTimePerQuestion: number;

  // Difficulty Performance
  difficultyPerformance: DifficultyPerformance[];

  // Skill Analysis
  strengthAreas: string[];
  improvementAreas: string[];

  // Progress Over Time
  progressTimeline: ProgressTimelineEntry[];

  // Streaks and Achievements
  currentStreak: number;
  longestStreak: number;

  updatedAt: Date;
}

export interface DifficultyPerformance {
  difficulty: "easy" | "medium" | "hard";
  questionsAnswered: number;
  accuracy: number;
  averageScore: number;
  averageTime: number;
}

export interface ProgressTimelineEntry {
  date: Date;
  quizzesTaken: number;
  averageScore: number;
  accuracy: number;
  timeSpent: number;
}

// Leaderboard Types
export interface LeaderboardEntry {
  _id: string;
  userId: string;
  username: string;
  categoryName?: string;

  // Performance Metrics
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalCorrectAnswers: number;
  accuracy: number;

  // Ranking
  rank: number;
  points: number;

  // Recent Activity
  lastActive: Date;
  recentPerformance: number; // Recent accuracy/score trend
}

// Quiz Configuration Types
export interface QuizConfiguration {
  _id: string;
  categoryName: string;

  // Difficulty Settings
  difficultyWeights: {
    easy: number;
    medium: number;
    hard: number;
  };

  // Question Selection Algorithm
  algorithmType: "random" | "adaptive" | "spaced_repetition";
  spacedRepetitionEnabled: boolean;

  // Session Settings
  defaultQuestionCount: number;
  maxQuestionCount: number;
  timeLimit?: number; // in minutes

  // Scoring
  scoringWeights: {
    correctAnswer: number;
    speed: number;
    difficulty: number;
  };

  updatedAt: Date;
  updatedBy: string;
}

// Admin Analytics Types
export interface QuizAnalytics {
  // Overall Statistics
  totalUsers: number;
  totalQuizzesTaken: number;
  totalQuestionsAnswered: number;
  averageSessionTime: number;

  // Performance Metrics
  overallAccuracy: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };

  // Popular Categories
  popularCategories: CategoryAnalytics[];

  // User Engagement
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };

  // Trends
  performanceTrends: PerformanceTrend[];

  generatedAt: Date;
}

export interface CategoryAnalytics {
  categoryName: string;
  totalQuizzes: number;
  averageScore: number;
  accuracy: number;
  popularity: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface PerformanceTrend {
  date: Date;
  averageScore: number;
  accuracy: number;
  activeUsers: number;
  quizzesTaken: number;
}

// Session Management Types
export interface QuizSession {
  _id: string;
  sessionId: string;
  userId: string;
  username?: string;
  quizId: string;
  categoryName: string;
  difficulty: string;
  questionCount: number;
  currentQuestionIndex: number;
  status: "active" | "completed" | "abandoned";
  startedAt: Date;
  completedAt?: Date;
  lastActivity: Date;
  score?: number;
  timeSpent?: number;
  progress: QuizSessionProgress;
}

export interface QuizSessionProgress {
  answered: number;
  total: number;
  percentage: number;
  currentQuestion?: string;
  timeRemaining?: number;
}

// Interview Prep Types
export interface InterviewSheet {
  _id: string;
  name: string;
  slug: string;
  description: string;
  meta: string;
  coverImageURL: string;
  liveOn: Date;
  roadmap: "Frontend" | "Backend" | "Fullstack" | "Tech" | "DSA";
  isPremium: boolean;
  price: number;
  discountPercentage?: number;
  features: string[];
  questions: InterviewQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewResource {
  type: string;
  url: string;
  label?: string;
}

export interface InterviewQuestion {
  _id: string;
  title: string;
  question: string;
  answer: string;
  resources?: InterviewResource[];
  frequency: "Most Asked" | "Asked Frequently" | "Asked Sometimes";
  companyTypes?: string[];
  priority: "High" | "Medium" | "Low";
  difficulty?: "Easy" | "Medium" | "Hard";
  questionIndex?: number;
  createdAt?: Date;
}

export interface UserInterviewPrep {
  _id: string;
  userId: string;
  sheetId: string;
  user: {
    userName: string;
    userEmail: string;
    userContactNo: string;
  };
  sheet: {
    name: string;
    description: string;
    roadmap: string;
  };
  questions: Array<{
    questionId: string;
    isCompleted: boolean;
    isStarred: boolean;
  }>;
  lastUpdated: Date;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

// Interview Generation Session Types (matching the API)
export interface InterviewGenerationSession {
  sessionId: string;
  topic: string;
  agentType: "generic" | "dsa" | "tech" | "system_design";
  technology?: string;
  roadmap: string;
  questionCount: number;
  status: "pending" | "in_progress" | "completed" | "failed";
  progress: {
    percent: number;
    current_step: string;
    completed_questions: number;
    total_questions: number;
  };
  startedAt: string;
  completedAt?: string;
  outputFile?: string;
  sheetData?: any;
  error?: string;
}

export interface BulkGenerationRequest {
  topics: Array<{
    name: string;
    agentType: "generic" | "dsa" | "tech" | "system_design";
    technology?: string;
    questionCount: number;
    roadmap: string;
    difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
  }>;
  generateAnswers: boolean;
  autoPublish: boolean;
}

export interface TopicTemplate {
  name: string;
  description: string;
  agentTypes: string[];
  suggestedQuestionCount: number;
  difficulty: string;
  roadmaps: string[];
  category?: string;
  tags?: string[];
}

export interface RoadmapSuggestion {
  name: string;
  description: string;
  topics: string[];
  technologies: string[];
  difficulty: string;
  estimatedTime?: string;
}

// Coupon Management Types
export interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  description: string;
  isActive: boolean;
  expiryDate: string;
  maxUsage?: number;
  currentUsage: number;
  minimumAmount: number;
  applicableProducts: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CouponFormData {
  code: string;
  discountPercentage: number;
  description: string;
  isActive: boolean;
  expiryDate: string;
  maxUsage?: number;
  minimumAmount: number;
  applicableProducts?: string[];
}

export interface CouponUsage {
  _id: string;
  couponId: string;
  userId: string;
  orderId?: string;
  discountAmount: number;
  usedAt: Date;
}

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalProjects: number;
  totalSheets: number;
  recentUsers?: Array<{ name: string; email: string; createdAt: string }>;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  createdAt?: string;
  isOnboarded?: boolean;
}

export interface UserCourse {
  _id: string;
  userId: string;
  courseId: string;
  user?: { name: string; email: string };
  course?: { name: string; slug: string };
  enrolledAt?: string;
}

export interface UserProject {
  _id: string;
  userId: string;
  projectId: string;
  user?: { name: string; email: string };
  project?: { name: string; slug: string };
}

export interface EmailRequest {
  from_email: string;
  from_name: string;
  to_email: string;
  to_name: string;
  subject: string;
  html_content: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  data: unknown;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
}

export interface OfferLetterData {
  candidateName: string;
  candidateEmail: string;
  position: string;
  department: string;
  startDate: string;
  duration?: string;
  salary?: string;
  location: string;
  reportingTo?: string;
  companyName?: string;
  additionalTerms?: string;
  responsibilities: string[];
  benefits: string[];
}

export interface DevRelOfferData {
  candidateName: string;
  candidateEmail: string;
  position: string;
  startDate: string;
  duration?: string;
  salary?: string;
  location: string;
  reportingTo?: string;
  responsibilities: string[];
  benefits: string[];
}

export interface PrepLogsResponse {
  data: UserWithPrepLogs[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserWithPrepLogs {
  userId: string;
  userName: string;
  userEmail: string;
  prepLogs: PrepLogEntry[];
}

export interface PrepLogEntry {
  _id: string;
  date: string;
  notes?: string;
  mentorFeedback?: string;
}

export interface PrepLogsSummary {
  totalUsers: number;
  totalLogs: number;
  activeStreaks: number;
}
