import type {
    AddAptitudeQuestionPayload,
    AddAptitudeTopicPayload,
    AptitudeCategoryType,
    AptitudeSubCategoryType,
    AptitudeUploadPayload,
    DatabaseQueryResponseType,
    DSADifficultyType,
} from "@/lib/interfaces"

import { AptitudeQuestion, AptitudeTopic } from "../models"

// ─── Topic Queries ───────────────────────────────────────────────────────────

const addAptitudeTopicToDB = async (
    payload: AddAptitudeTopicPayload
): Promise<DatabaseQueryResponseType> => {
    try {
        const topic = new AptitudeTopic(payload)
        await topic.save()
        return { data: topic }
    } catch (error) {
        return { error: "Failed to create aptitude topic", details: error }
    }
}

const getAllAptitudeTopicsFromDB = async (filters: {
    category?: AptitudeCategoryType
    subCategory?: AptitudeSubCategoryType
    isActive?: boolean
} = {}): Promise<DatabaseQueryResponseType> => {
    try {
        const matchStage: any = {}

        if (filters.category) matchStage.category = filters.category
        if (filters.subCategory) matchStage.subCategory = filters.subCategory
        if (filters.isActive !== undefined) matchStage.isActive = filters.isActive

        const topics = await AptitudeTopic.find(matchStage)
            .sort({ category: 1, subCategory: 1, order: 1 })
            .lean()

        return { data: topics }
    } catch (error) {
        return { error: "Failed to fetch aptitude topics", details: error }
    }
}

const getAptitudeTopicBySlugFromDB = async (
    slug: string
): Promise<DatabaseQueryResponseType> => {
    try {
        const topic = await AptitudeTopic.findOne({ slug }).lean()
        if (!topic) return { error: "Topic not found" }
        return { data: topic }
    } catch (error) {
        return { error: "Failed to fetch topic", details: error }
    }
}

const getAptitudeTopicByIdFromDB = async (
    topicId: string
): Promise<DatabaseQueryResponseType> => {
    try {
        const topic = await AptitudeTopic.findById(topicId).lean()
        if (!topic) return { error: "Topic not found" }
        return { data: topic }
    } catch (error) {
        return { error: "Failed to fetch topic", details: error }
    }
}

const updateAptitudeTopicInDB = async (
    topicId: string,
    updates: Partial<AddAptitudeTopicPayload & { isActive: boolean }>
): Promise<DatabaseQueryResponseType> => {
    try {
        const topic = await AptitudeTopic.findByIdAndUpdate(
            topicId,
            updates,
            { new: true }
        )
        if (!topic) return { error: "Topic not found" }
        return { data: topic }
    } catch (error) {
        return { error: "Failed to update topic", details: error }
    }
}

// ─── Question Queries ────────────────────────────────────────────────────────

const addAptitudeQuestionToDB = async (
    payload: AddAptitudeQuestionPayload
): Promise<DatabaseQueryResponseType> => {
    try {
        const question = new AptitudeQuestion(payload)
        await question.save()
        return { data: question }
    } catch (error) {
        return { error: "Failed to create aptitude question", details: error }
    }
}

const getAptitudeQuestionsByTopicFromDB = async (
    topicId: string,
    filters: {
        difficulty?: DSADifficultyType
        page?: number
        limit?: number
    } = {}
): Promise<DatabaseQueryResponseType> => {
    try {
        const { difficulty, page = 1, limit = 50 } = filters
        const matchStage: any = { topicId, isActive: true }

        if (difficulty) matchStage.difficulty = difficulty

        const totalCount = await AptitudeQuestion.countDocuments(matchStage)
        const questions = await AptitudeQuestion.find(matchStage)
            .sort({ order: 1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()

        return {
            data: {
                questions,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    totalPages: Math.ceil(totalCount / limit),
                    hasMore: page * limit < totalCount,
                },
            },
        }
    } catch (error) {
        return { error: "Failed to fetch questions", details: error }
    }
}

const updateAptitudeQuestionInDB = async (
    questionId: string,
    updates: Partial<AddAptitudeQuestionPayload & { isActive: boolean }>
): Promise<DatabaseQueryResponseType> => {
    try {
        const question = await AptitudeQuestion.findByIdAndUpdate(
            questionId,
            updates,
            { new: true }
        )
        if (!question) return { error: "Question not found" }
        return { data: question }
    } catch (error) {
        return { error: "Failed to update question", details: error }
    }
}

// ─── Metadata & Aggregations ─────────────────────────────────────────────────

const getAptitudeMetadataFromDB = async (): Promise<DatabaseQueryResponseType> => {
    try {
        const [categories, subCategories, totalTopics, totalQuestions] = await Promise.all([
            AptitudeTopic.distinct("category"),
            AptitudeTopic.distinct("subCategory"),
            AptitudeTopic.countDocuments({ isActive: true }),
            AptitudeQuestion.countDocuments({ isActive: true }),
        ])

        const topicsGrouped = await AptitudeTopic.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: { category: "$category", subCategory: "$subCategory" },
                    topics: { $push: { _id: "$_id", name: "$name", slug: "$slug" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.category": 1, "_id.subCategory": 1 } },
        ])

        return {
            data: {
                categories: categories.sort(),
                subCategories: subCategories.sort(),
                totalTopics,
                totalQuestions,
                grouped: topicsGrouped.map((g) => ({
                    category: g._id.category,
                    subCategory: g._id.subCategory,
                    topics: g.topics,
                    topicCount: g.count,
                })),
            },
        }
    } catch (error) {
        return { error: "Failed to fetch aptitude metadata", details: error }
    }
}

const getAptitudeTopicsWithQuestionCountFromDB = async (filters: {
    category?: AptitudeCategoryType
    subCategory?: AptitudeSubCategoryType
} = {}): Promise<DatabaseQueryResponseType> => {
    try {
        const matchStage: any = { isActive: true }
        if (filters.category) matchStage.category = filters.category
        if (filters.subCategory) matchStage.subCategory = filters.subCategory

        const topics = await AptitudeTopic.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: "aptitudequestions",
                    localField: "_id",
                    foreignField: "topicId",
                    pipeline: [
                        { $match: { isActive: true } },
                        { $count: "count" },
                    ],
                    as: "questionStats",
                },
            },
            {
                $addFields: {
                    questionCount: {
                        $ifNull: [{ $arrayElemAt: ["$questionStats.count", 0] }, 0],
                    },
                },
            },
            { $project: { questionStats: 0 } },
            { $sort: { category: 1, subCategory: 1, order: 1 } },
        ])

        return { data: topics }
    } catch (error) {
        return { error: "Failed to fetch topics with counts", details: error }
    }
}

// ─── Bulk Upload (from Agents) ───────────────────────────────────────────────

const bulkUploadAptitudeDataToDB = async (
    payload: AptitudeUploadPayload
): Promise<DatabaseQueryResponseType> => {
    try {
        const results: { topics: number; questions: number } = { topics: 0, questions: 0 }

        for (const topicData of payload.topics) {
            const { questions: questionsPayload, ...topicPayload } = topicData

            let topic = await AptitudeTopic.findOne({ slug: topicPayload.slug })
            if (!topic) {
                topic = await AptitudeTopic.create(topicPayload)
                results.topics++
            }

            if (questionsPayload?.length) {
                const questionsToInsert = questionsPayload.map((q) => ({
                    ...q,
                    topicId: topic!._id,
                }))
                await AptitudeQuestion.insertMany(questionsToInsert)
                results.questions += questionsToInsert.length
            }
        }

        return { data: results }
    } catch (error) {
        return { error: "Failed to bulk upload aptitude data", details: error }
    }
}

export {
    addAptitudeQuestionToDB,
    addAptitudeTopicToDB,
    bulkUploadAptitudeDataToDB,
    getAllAptitudeTopicsFromDB,
    getAptitudeMetadataFromDB,
    getAptitudeQuestionsByTopicFromDB,
    getAptitudeTopicByIdFromDB,
    getAptitudeTopicBySlugFromDB,
    getAptitudeTopicsWithQuestionCountFromDB,
    updateAptitudeQuestionInDB,
    updateAptitudeTopicInDB,
}
