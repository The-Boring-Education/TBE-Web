import { Quiz, QuizAttempt } from "../models"
import type { QuizModel } from "../models/Quiz/Quiz"
import type { QuizAttemptModel } from "../models/Quiz/QuizAttempt"
import type { DatabaseQueryResponseType } from "@/lib/interfaces"

// Add a quiz to database
const addAQuizToDB = async (
    quizData: Omit<QuizModel, "_id" | "createdAt" | "updatedAt">
): Promise<DatabaseQueryResponseType> => {
    try {
        const quiz = new Quiz(quizData)
        await quiz.save()
        return { data: quiz }
    } catch (error) {
        return { error: "Failed while adding quiz", details: error }
    }
}

// Update a quiz in database
const updateAQuizInDB = async ({
    id,
    updatedData
}: {
    id: string
    updatedData: Partial<Omit<QuizModel, "_id" | "createdAt" | "updatedAt">>
}): Promise<DatabaseQueryResponseType> => {
    try {
        const updatedQuiz = await Quiz.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true
        })

        if (!updatedQuiz) return { error: "Quiz does not exist" }

        return { data: updatedQuiz }
    } catch (error) {
        return { error: "Failed while updating quiz" }
    }
}

// Get all quiz categories from database
const getQuizCategoriesFromDB = async (
    includeInactive: boolean
): Promise<DatabaseQueryResponseType> => {
    try {
        const filter = includeInactive ? {} : { isActive: true }
        const categories = await Quiz.find(
            filter,
            "_id categoryName categoryDescription categoryIcon isActive"
        ).lean()

        return { data: categories }
    } catch (error) {
        return { error: "Failed while fetching quiz categories" }
    }
}

// Get quiz by ID from database
const getQuizByIdFromDB = async (
    id: string,
    includeInactive: boolean
): Promise<DatabaseQueryResponseType> => {
    try {
        const filter = includeInactive
            ? { _id: id }
            : { _id: id, isActive: true }
        const quiz = await Quiz.findOne(filter).lean()

        if (!quiz) {
            return { error: "Quiz not found" }
        }

        return { data: quiz }
    } catch (error) {
        return { error: "Failed while fetching quiz" }
    }
}

// Get quiz categories with question counts
const getQuizCategoriesWithCountsFromDB = async (
    includeInactive: boolean
): Promise<DatabaseQueryResponseType> => {
    try {
        const matchFilter = includeInactive ? {} : { isActive: true }
        const categories = await Quiz.aggregate([
            { $match: matchFilter },
            {
                $project: {
                    _id: 1,
                    categoryName: 1,
                    categoryDescription: 1,
                    categoryIcon: 1,
                    isActive: 1,
                    questionCount: { $size: { $ifNull: ["$questions", []] } }
                }
            }
        ])

        return { data: categories }
    } catch (error) {
        return { error: "Failed while fetching quiz categories with counts" }
    }
}

// Append questions to an existing quiz
const appendQuestionsToQuizInDB = async (
    id: string,
    questions: QuizModel["questions"]
): Promise<DatabaseQueryResponseType> => {
    try {
        if (!Array.isArray(questions) || questions.length === 0) {
            return { error: "Questions must be a non-empty array" }
        }

        const updated = await Quiz.findByIdAndUpdate(
            id,
            { $push: { questions: { $each: questions } } },
            { new: true, runValidators: true }
        )

        if (!updated) return { error: "Quiz not found" }

        return { data: updated }
    } catch (error) {
        return { error: "Failed while appending questions to quiz" }
    }
}

// Save quiz attempt to database
const saveQuizAttemptToDB = async (
    attemptData: Partial<QuizAttemptModel>
): Promise<DatabaseQueryResponseType> => {
    try {
        const attempt = new QuizAttempt(attemptData)
        const savedAttempt = await attempt.save()
        return { data: savedAttempt }
    } catch (error) {
        return { error: "Failed while saving quiz attempt" }
    }
}

// Get user quiz history from database
const getUserQuizHistoryFromDB = async ({
    userId,
    limit = 20,
    quizId
}: {
    userId: string
    limit?: number
    quizId?: string
}): Promise<DatabaseQueryResponseType> => {
    try {
        let query = QuizAttempt.find({ userId })

        if (quizId) {
            query = query.where("quizId").equals(quizId)
        }

        const attempts = await query
            .sort({ completedAt: -1 })
            .limit(limit)
            .lean()

        return { data: attempts }
    } catch (error) {
        return { error: "Failed while fetching quiz history" }
    }
}

// Get user quiz statistics from database
const getUserQuizStatsFromDB = async (
    userId: string
): Promise<DatabaseQueryResponseType> => {
    try {
        const stats = await QuizAttempt.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    totalQuizzes: { $sum: 1 },
                    totalPoints: { $sum: "$pointsEarned" },
                    totalCorrectAnswers: { $sum: "$correctAnswers" },
                    totalQuestions: { $sum: "$totalQuestions" },
                    averageScore: { $avg: "$score" },
                    averageTimeTaken: { $avg: "$timeTaken" }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalQuizzes: 1,
                    totalPoints: 1,
                    totalCorrectAnswers: 1,
                    totalQuestions: 1,
                    averageScore: { $round: ["$averageScore", 2] },
                    averageTimeTaken: { $round: ["$averageTimeTaken", 0] },
                    overallAccuracy: {
                        $round: [
                            {
                                $multiply: [
                                    {
                                        $divide: [
                                            "$totalCorrectAnswers",
                                            "$totalQuestions"
                                        ]
                                    },
                                    100
                                ]
                            },
                            2
                        ]
                    }
                }
            }
        ])

        const defaultStats = {
            totalQuizzes: 0,
            totalPoints: 0,
            totalCorrectAnswers: 0,
            totalQuestions: 0,
            averageScore: 0,
            averageTimeTaken: 0,
            overallAccuracy: 0
        }

        return { data: stats[0] || defaultStats }
    } catch (error) {
        return { error: "Failed while fetching quiz statistics" }
    }
}

export {
    addAQuizToDB,
    getQuizByIdFromDB,
    getQuizCategoriesFromDB,
    getQuizCategoriesWithCountsFromDB,
    getUserQuizHistoryFromDB,
    getUserQuizStatsFromDB,
    saveQuizAttemptToDB,
    updateAQuizInDB,
    appendQuestionsToQuizInDB
}
