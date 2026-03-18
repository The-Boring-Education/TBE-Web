/**
 * Tiered caching configuration for React Query.
 *
 * Tiers are designed around how frequently data actually changes in production,
 * NOT how frequently we want to fetch. React Query's stale-while-revalidate
 * pattern means users always see cached data instantly and get background updates.
 *
 * staleTime  = how long before data is considered "stale" (triggers background refetch)
 * gcTime     = how long unused data stays in memory (garbage collection)
 */
export const CACHE_TIMES = {
  /**
   * Landing pages, explore page lists, course/project catalogs.
   * These are curated content that changes on editorial cadence (days/weeks).
   * Users navigating back-and-forth should never see a loading spinner.
   */
  STATIC: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },

  /**
   * Learning content — aptitude topics, DSA questions, interview sheets,
   * quiz categories, sheet metadata.
   * Content is author-driven; changes are infrequent but more often than landing pages.
   */
  STABLE: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },

  /**
   * User-specific data that changes with user actions —
   * profile, prep stats, prep logs, gamification points, progress.
   */
  STANDARD: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  /**
   * Frequently updating shared data — leaderboards, live quiz results.
   */
  DYNAMIC: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  },

  /**
   * Must always be fresh — payment status, auth session, quiz submissions.
   * Still benefits from deduplication (multiple components mounting won't
   * cause multiple requests within the same render cycle).
   */
  REALTIME: {
    staleTime: 0,
    gcTime: 60 * 1000, // 1 minute
  },
} as const;

export type CacheTier = keyof typeof CACHE_TIMES;
