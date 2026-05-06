/**
 * Centralized query key factory.
 *
 * Why a factory? Query keys must be consistent across the entire app for
 * cache hits and invalidation to work. A typo in a string key means a cache miss.
 * This factory makes keys type-safe and greppable.
 *
 * Convention:
 *   queryKeys.<domain>.all        → invalidate everything in the domain
 *   queryKeys.<domain>.lists()    → all list queries in the domain
 *   queryKeys.<domain>.list(...)  → a specific filtered list
 *   queryKeys.<domain>.detail(id) → a single entity
 */
export const queryKeys = {
  // ── Interview Prep ──
  interviewPrep: {
    all: ["interview-prep"] as const,
    lists: () => [...queryKeys.interviewPrep.all, "list"] as const,
    list: (filters?: { roadmap?: string; topic?: string }) =>
      [...queryKeys.interviewPrep.lists(), filters] as const,
    detail: (slug: string) =>
      [...queryKeys.interviewPrep.all, "detail", slug] as const,
    sheet: (slug: string, userId?: string) =>
      [...queryKeys.interviewPrep.all, "sheet", slug, userId] as const,
  },

  // ── Aptitude (subset of interview prep, but distinct cache) ──
  aptitude: {
    all: ["aptitude"] as const,
    topics: () => [...queryKeys.aptitude.all, "topics"] as const,
    questions: (topic: string, userId?: string) =>
      [
        ...queryKeys.aptitude.all,
        "questions",
        topic,
        userId ?? "__no_user__",
      ] as const,
    studyGuide: (topic: string) =>
      [...queryKeys.aptitude.all, "study-guide", topic] as const,
  },

  // ── DSA ──
  dsa: {
    all: ["dsa"] as const,
    sheets: () => [...queryKeys.dsa.all, "sheets"] as const,
    sheet: (slug: string, userId?: string) =>
      [...queryKeys.dsa.all, "sheet", slug, userId] as const,
    questions: (filters?: {
      limit?: number;
      topic?: string;
      userId?: string;
      duration?: string;
      offCampus?: boolean;
      productType?: string;
      realWorld?: string;
      experienceLevel?: string;
    }) => [...queryKeys.dsa.all, "questions", filters] as const,
    completedQuestions: (userId: string) =>
      [...queryKeys.dsa.all, "completed", userId] as const,
    topics: (userId?: string) =>
      userId
        ? ([...queryKeys.dsa.all, "topics", userId] as const)
        : ([...queryKeys.dsa.all, "topics"] as const),
  },

  // ── Courses (Shiksha) ──
  shiksha: {
    all: ["shiksha"] as const,
    lists: () => [...queryKeys.shiksha.all, "list"] as const,
    detail: (slug: string) =>
      [...queryKeys.shiksha.all, "detail", slug] as const,
  },

  // ── Projects ──
  projects: {
    all: ["projects"] as const,
    lists: () => [...queryKeys.projects.all, "list"] as const,
    detail: (slug: string) =>
      [...queryKeys.projects.all, "detail", slug] as const,
  },

  // ── Quizzes ──
  quiz: {
    all: ["quiz"] as const,
    categories: () => [...queryKeys.quiz.all, "categories"] as const,
    detail: (id: string) => [...queryKeys.quiz.all, "detail", id] as const,
    attempts: (userId: string) =>
      [...queryKeys.quiz.all, "attempts", userId] as const,
    performance: (userId: string, timeRange?: string) =>
      [...queryKeys.quiz.all, "performance", userId, timeRange] as const,
    analytics: (userId: string, timeRange?: string) =>
      [...queryKeys.quiz.all, "analytics", userId, timeRange] as const,
    leaderboard: (limit?: number) =>
      [...queryKeys.quiz.all, "leaderboard", limit] as const,
  },

  // ── User ──
  user: {
    all: ["user"] as const,
    current: () => [...queryKeys.user.all, "current"] as const,
    detail: (id: string) => [...queryKeys.user.all, "detail", id] as const,
    profile: (id: string) => [...queryKeys.user.all, "profile", id] as const,
    rank: (id: string) => [...queryKeys.user.all, "rank", id] as const,
    /** Authenticated full user record for onboarding redirect gates */
    onboardingGate: (userId: string) =>
      [...queryKeys.user.all, "onboarding-gate", userId] as const,
  },

  // ── Gamification ──
  gamification: {
    all: ["gamification"] as const,
    points: (userId: string) =>
      [...queryKeys.gamification.all, "points", userId] as const,
    leaderboard: () => [...queryKeys.gamification.all, "leaderboard"] as const,
  },

  // ── Prep Yatra ──
  prepYatra: {
    all: ["prep-yatra"] as const,
    logs: (userId: string) =>
      [...queryKeys.prepYatra.all, "logs", userId] as const,
    stats: (userId: string) =>
      [...queryKeys.prepYatra.all, "stats", userId] as const,
  },

  // ── Resume ──
  resume: {
    all: ["resume"] as const,
    progress: (userId?: string) =>
      [...queryKeys.resume.all, "progress", userId] as const,
  },

  // ── YouFocus ──
  youfocus: {
    all: ["youfocus"] as const,
    playlists: (skill: string) =>
      [...queryKeys.youfocus.all, "playlists", skill] as const,
    playlist: (id: string) =>
      [...queryKeys.youfocus.all, "playlist", id] as const,
  },

  // ── Payments ──
  payment: {
    all: ["payment"] as const,
    status: (userId: string, productId: string) =>
      [...queryKeys.payment.all, "status", userId, productId] as const,
  },

  // ── Challenges ──
  challenges: {
    all: ["challenges"] as const,
    lists: () => [...queryKeys.challenges.all, "list"] as const,
    progress: (userId: string) =>
      [...queryKeys.challenges.all, "progress", userId] as const,
  },

  // ── Onboarding ──
  onboarding: {
    all: ["onboarding"] as const,
    status: (userId: string) =>
      [...queryKeys.onboarding.all, "status", userId] as const,
  },
} as const;
