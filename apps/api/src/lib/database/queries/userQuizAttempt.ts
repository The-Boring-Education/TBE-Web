
import type { DatabaseQueryResponseType } from "@/lib/interfaces"

import { QuizAttempt } from "../models"

interface QuizAttemptData {
    userId: string
    quizId: string
    score: number
    totalQuestions: number
    correctAnswers: number
    totalTimeSpent: number
    answers: any[]
    categoryName: string
    completedAt: string
}

interface UserPerformanceStats {
    totalAttempts: number
    totalQuizzes: number
    averageScore: number
    bestScore: number
    totalTimeSpent: number
    categoryBreakdown: {
        categoryName: string
        attempts: number
        averageScore: number
        bestScore: number
    }[]
    recentAttempts: {
        _id: string
        quizId: string
        categoryName: string
        score: number
        completedAt: string
        totalTimeSpent: number
    }[]
}

interface LeaderboardEntry {
    userId: string
    username: string
    averageScore: number
    totalAttempts: number
    bestScore: number
    totalTimeSpent: number
}

// Add a new quiz attempt
export const addUserQuizAttemptToDB = async (
    attemptData: QuizAttemptData
): Promise<DatabaseQueryResponseType> => {
    try {
        const attempt = new QuizAttempt({
            userId: attemptData.userId, // Remove the extra ObjectId wrapper - mongoose will handle the conversion
            quizId: attemptData.quizId, // Remove the extra ObjectId wrapper - mongoose will handle the conversion
            score: attemptData.score,
            totalQuestions: attemptData.totalQuestions,
            correctAnswers: attemptData.correctAnswers,
            timeTaken: attemptData.totalTimeSpent, // Fix: use timeTaken instead of totalTimeSpent
            answers: attemptData.answers,
            categoryName: attemptData.categoryName,
            pointsEarned: Math.round(
                (attemptData.correctAnswers / attemptData.totalQuestions) * 100
            ), // Add missing pointsEarned
            completedAt: new Date(attemptData.completedAt)
        })

        const savedAttempt = await attempt.save()
        return { data: savedAttempt }
    } catch (error) {
        console.error("Error saving quiz attempt:", error)
        console.error(
            "Attempt data that failed:",
            JSON.stringify(attemptData, null, 2)
        )
        if (error instanceof Error) {
            console.error("Error details:", error.message)
            console.error("Error stack:", error.stack)
        }
        return { error: "Failed to save quiz attempt" }
    }
}

// Get user's quiz performance analytics
export const getUserQuizPerformanceFromDB = async (
    userId: string
): Promise<DatabaseQueryResponseType> => {
    try {
        // Use string comparison for userId to avoid ObjectId conversion issues
        const attempts = await QuizAttempt.find({}).lean()

        // Filter attempts by userId string comparison
        const userAttempts = attempts.filter(
            (attempt) => attempt.userId.toString() === userId
        )

        if (userAttempts.length === 0) {
            return {
                data: {
                    totalAttempts: 0,
                    totalQuizzes: 0,
                    averageScore: 0,
                    bestScore: 0,
                    totalTimeSpent: 0,
                    categoryBreakdown: [],
                    recentAttempts: []
                }
            }
        }

        // Calculate overall stats
        const totalAttempts = userAttempts.length
        const uniqueQuizzes = new Set(
            userAttempts.map((a) => a.quizId.toString())
        ).size
        const averageScore = Math.round(
            userAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
                totalAttempts
        )
        const bestScore = Math.max(...userAttempts.map((a) => a.score))
        const totalTimeSpent = userAttempts.reduce(
            (sum, attempt) => sum + (attempt.timeTaken || 0),
            0
        )

        // Category breakdown
        const categoryMap = new Map<
            string,
            { scores: number[]; attempts: number }
        >()

        userAttempts.forEach((attempt) => {
            const category = attempt.categoryName
            if (!categoryMap.has(category)) {
                categoryMap.set(category, { scores: [], attempts: 0 })
            }
            const categoryData = categoryMap.get(category)!
            categoryData.scores.push(attempt.score)
            categoryData.attempts++
        })

        const categoryBreakdown = Array.from(categoryMap.entries()).map(
            ([categoryName, data]) => ({
                categoryName,
                attempts: data.attempts,
                averageScore: Math.round(
                    data.scores.reduce((sum, score) => sum + score, 0) /
                        data.scores.length
                ),
                bestScore: Math.max(...data.scores)
            })
        )

        // Recent attempts (last 10)
        const recentAttempts = userAttempts.slice(0, 10).map((attempt) => ({
            _id: attempt._id.toString(),
            quizId: attempt.quizId.toString(),
            categoryName: attempt.categoryName,
            score: attempt.score,
            completedAt:
                attempt.completedAt?.toISOString() || new Date().toISOString(),
            totalTimeSpent: attempt.timeTaken || 0
        }))

        const performanceStats: UserPerformanceStats = {
            totalAttempts,
            totalQuizzes: uniqueQuizzes,
            averageScore,
            bestScore,
            totalTimeSpent,
            categoryBreakdown,
            recentAttempts
        }

        return { data: performanceStats }
    } catch (error) {
        console.error("Error getting user performance:", error)
        // Return empty results instead of error for better UX
        return {
            data: {
                totalAttempts: 0,
                totalQuizzes: 0,
                averageScore: 0,
                bestScore: 0,
                totalTimeSpent: 0,
                categoryBreakdown: [],
                recentAttempts: []
            }
        }
    }
}

// Get leaderboard entries
export const getLeaderboardFromDB = async (
    limit = 10
): Promise<DatabaseQueryResponseType> => {
    try {
        const attempts = await QuizAttempt.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $group: {
                    _id: "$userId",
                    username: { $first: "$user.name" },
                    image: { $first: "$user.image" },
                    bestScore: { $max: "$score" },
                    totalAttempts: { $sum: 1 },
                    averageScore: { $avg: "$score" },
                    totalTimeSpent: { $sum: "$timeTaken" }
                }
            },
            {
                $sort: { bestScore: -1 }
            },
            {
                $limit: limit
            }
        ])

        return { data: attempts }
    } catch (error) {
        console.error("Error getting leaderboard:", error)
        return { error: "Failed to get leaderboard" }
    }
}

// Get admin analytics for quiz system
export const getQuizAdminAnalyticsFromDB =
    async (): Promise<DatabaseQueryResponseType> => {
        try {
            const [
                totalAttempts,
                uniqueUsers,
                totalCategories,
                avgTimePerQuiz
            ] = await Promise.all([
                QuizAttempt.countDocuments(),
                QuizAttempt.distinct("userId").then((users) => users.length),
                QuizAttempt.distinct("categoryName").then(
                    (categories) => categories.length
                ),
                QuizAttempt.aggregate([
                    { $group: { _id: null, avgTime: { $avg: "$timeTaken" } } }
                ]).then((result) => result[0]?.avgTime || 0)
            ])

            // Category performance
            const categoryStats = await QuizAttempt.aggregate([
                {
                    $group: {
                        _id: "$categoryName",
                        totalAttempts: { $sum: 1 },
                        averageScore: { $avg: "$score" },
                        uniqueUsers: { $addToSet: "$userId" }
                    }
                },
                {
                    $addFields: {
                        uniqueUserCount: { $size: "$uniqueUsers" }
                    }
                },
                {
                    $project: {
                        categoryName: "$_id",
                        totalAttempts: 1,
                        averageScore: { $round: ["$averageScore", 1] },
                        uniqueUsers: "$uniqueUserCount"
                    }
                },
                { $sort: { totalAttempts: -1 } }
            ])

            // Recent activity (last 7 days)
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

            const recentActivity = await QuizAttempt.aggregate([
                { $match: { completedAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$completedAt"
                            }
                        },
                        count: { $sum: 1 },
                        avgScore: { $avg: "$score" }
                    }
                },
                { $sort: { _id: 1 } }
            ])

            const analytics = {
                overview: {
                    totalAttempts,
                    uniqueUsers,
                    totalCategories,
                    avgTimePerQuiz: Math.round(avgTimePerQuiz)
                },
                categoryStats,
                recentActivity
            }

            return { data: analytics }
        } catch (error) {
            console.error("Error getting admin analytics:", error)
            return { error: "Failed to get admin analytics" }
        }
    }
