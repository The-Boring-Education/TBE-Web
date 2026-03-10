import {
  APTITUDE_SUB_CATEGORY_FORMAT_MAP,
  APTITUDE_TOPIC_SLUGS,
  APTITUDE_TOPICS,
} from "@/lib/constants";
import type {
  AddAptitudeQuestionPayload,
  AptitudeCategoryType,
  AptitudeSubCategoryType,
  AptitudeUploadPayload,
  DatabaseQueryResponseType,
  DSADifficultyType,
} from "@/lib/interfaces";

import { AptitudeQuestion } from "../models";

// ─── Question Queries ────────────────────────────────────────────────────────

const addAptitudeQuestionToDB = async (
  payload: AddAptitudeQuestionPayload,
): Promise<DatabaseQueryResponseType> => {
  try {
    if (!APTITUDE_TOPIC_SLUGS.includes(payload.topic)) {
      return { error: `Invalid topic slug: ${payload.topic}` };
    }
    const question = new AptitudeQuestion(payload);
    await question.save();
    return { data: question };
  } catch (error) {
    return { error: "Failed to create aptitude question", details: error };
  }
};

const getAptitudeQuestionsByTopicFromDB = async (
  topic: string,
  filters: {
    difficulty?: DSADifficultyType;
    page?: number;
    limit?: number;
  } = {},
): Promise<DatabaseQueryResponseType> => {
  try {
    const { difficulty, page = 1, limit = 50 } = filters;
    const matchStage: Record<string, unknown> = { topic, isActive: true };

    if (difficulty) matchStage.difficulty = difficulty;

    const totalCount = await AptitudeQuestion.countDocuments(matchStage);
    const questions = await AptitudeQuestion.find(matchStage)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

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
    };
  } catch (error) {
    return { error: "Failed to fetch questions", details: error };
  }
};

const updateAptitudeQuestionInDB = async (
  questionId: string,
  updates: Partial<AddAptitudeQuestionPayload & { isActive: boolean }>,
): Promise<DatabaseQueryResponseType> => {
  try {
    if (updates.topic && !APTITUDE_TOPIC_SLUGS.includes(updates.topic)) {
      return { error: `Invalid topic slug: ${updates.topic}` };
    }
    const question = await AptitudeQuestion.findByIdAndUpdate(
      questionId,
      updates,
      { new: true },
    );
    if (!question) return { error: "Question not found" };
    return { data: question };
  } catch (error) {
    return { error: "Failed to update question", details: error };
  }
};

// ─── Topics (derived from constants + question counts) ───────────────────────

const getAptitudeTopicsWithQuestionCountFromDB = async (
  filters: {
    category?: AptitudeCategoryType;
    subCategory?: AptitudeSubCategoryType;
  } = {},
): Promise<DatabaseQueryResponseType> => {
  try {
    let topics = APTITUDE_TOPICS;
    if (filters.category) {
      topics = topics.filter((t) => t.category === filters.category);
    }
    if (filters.subCategory) {
      topics = topics.filter((t) => t.subCategory === filters.subCategory);
    }

    const slugs = topics.map((t) => t.slug);

    const counts = await AptitudeQuestion.aggregate([
      { $match: { topic: { $in: slugs }, isActive: true } },
      { $group: { _id: "$topic", questionCount: { $sum: 1 } } },
    ]);

    const countMap = new Map(counts.map((c) => [c._id, c.questionCount]));

    const data = topics.map((t) => ({
      ...t,
      answerFormatType: APTITUDE_SUB_CATEGORY_FORMAT_MAP[t.subCategory],
      questionCount: countMap.get(t.slug) || 0,
    }));

    return { data };
  } catch (error) {
    return { error: "Failed to fetch topics with counts", details: error };
  }
};

// ─── Metadata ────────────────────────────────────────────────────────────────

const getAptitudeMetadataFromDB =
  async (): Promise<DatabaseQueryResponseType> => {
    try {
      const categories = [
        ...new Set(APTITUDE_TOPICS.map((t) => t.category)),
      ].sort();
      const subCategories = [
        ...new Set(APTITUDE_TOPICS.map((t) => t.subCategory)),
      ].sort();

      const totalQuestions = await AptitudeQuestion.countDocuments({
        isActive: true,
      });

      const grouped = categories
        .map((category) => {
          const categoryTopics = APTITUDE_TOPICS.filter(
            (t) => t.category === category,
          );
          const subCats = [
            ...new Set(categoryTopics.map((t) => t.subCategory)),
          ];

          return subCats.map((subCategory) => ({
            category,
            subCategory,
            answerFormatType:
              APTITUDE_SUB_CATEGORY_FORMAT_MAP[
                subCategory as AptitudeSubCategoryType
              ],
            topics: categoryTopics
              .filter((t) => t.subCategory === subCategory)
              .map((t) => ({ name: t.name, slug: t.slug })),
            topicCount: categoryTopics.filter(
              (t) => t.subCategory === subCategory,
            ).length,
          }));
        })
        .flat();

      return {
        data: {
          categories,
          subCategories,
          totalTopics: APTITUDE_TOPICS.length,
          totalQuestions,
          grouped,
        },
      };
    } catch (error) {
      return { error: "Failed to fetch aptitude metadata", details: error };
    }
  };

// ─── Bulk Upload (from Agents) ───────────────────────────────────────────────

const bulkUploadAptitudeDataToDB = async (
  payload: AptitudeUploadPayload,
): Promise<DatabaseQueryResponseType> => {
  try {
    const { topic, questions } = payload;

    if (!APTITUDE_TOPIC_SLUGS.includes(topic)) {
      return { error: `Invalid topic slug: ${topic}` };
    }

    if (!questions?.length) {
      return { error: "No questions provided" };
    }

    const questionsToInsert = questions.map((q) => ({
      ...q,
      topic,
    }));

    const inserted = await AptitudeQuestion.insertMany(questionsToInsert);

    return { data: { topic, questionsInserted: inserted.length } };
  } catch (error) {
    return { error: "Failed to bulk upload aptitude data", details: error };
  }
};

export {
  addAptitudeQuestionToDB,
  bulkUploadAptitudeDataToDB,
  getAptitudeMetadataFromDB,
  getAptitudeQuestionsByTopicFromDB,
  getAptitudeTopicsWithQuestionCountFromDB,
  updateAptitudeQuestionInDB,
};
