// Export all database queries (non-conflicting ones)
export * from './certificate'
export * from './common'
export * from './coupon'
export * from './email'
export * from './feedback'
export * from './interview-prep'
export * from './leaderboard'
export * from './notification'
export * from './payment'
export * from './prepyatra'
export * from './project'
export * from './quiz'
export * from './shiksha'
export * from './unskilled'
export * from './user'
export * from './userInterest'
export * from './webinar'
export * from './youfocus'

// Export enhanced quiz functions (keep original names for main functions)
export {
  createQuizSessionInDB,
  submitAnswerInDB,
  completeQuizSessionInDB,
  updateUserQuestionPerformance,
  updateUserAnalyticsInDB,
  getUserAnalyticsFromDB,
  getQuizLeaderboardFromDB,
  getUserQuizSessionsFromDB,
  getQuizAdminAnalyticsFromDB,
  getActiveSessionsFromDB,
} from './enhancedQuiz'

// Export gamification functions (keep getLeaderboardFromDB as the main one)
export {
  addGamificationDocInDB,
  getUserPointsFromDB,
  getLeaderboardFromDB,
  getActionsWithinDateRange,
  handleGamificationPoints,
  updateUserPointsInDB,
} from './gamification'

// Export user quiz attempt functions (alias the conflicting ones)
export {
  addUserQuizAttemptToDB,
  getUserQuizPerformanceFromDB,
  getLeaderboardFromDB as getUserQuizLeaderboardFromDB,
  getQuizAdminAnalyticsFromDB as getUserQuizAdminAnalyticsFromDB,
} from './userQuizAttempt'
