import { v4 as uuidv4 } from "uuid";

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
import { logger } from "@/lib/utils/logger";

import { AptitudeTopic } from "../models";

// ─── Question Queries ────────────────────────────────────────────────────────

/**
 * @deprecated Use bulkUploadAptitudeQuestionsToTopic instead for consolidated model
 */
const addAptitudeQuestionToDB = async (
  topic: string,
  payload: AddAptitudeQuestionPayload,
): Promise<DatabaseQueryResponseType> => {
  try {
    if (!APTITUDE_TOPIC_SLUGS.includes(topic)) {
      return { error: `Invalid topic slug: ${topic}` };
    }

    const updatedTopic = await AptitudeTopic.findOneAndUpdate(
      { topic },
      { $push: { questions: payload } },
      { new: true, upsert: true },
    );

    return { data: updatedTopic };
  } catch (error) {
    return { error: "Failed to add aptitude question", details: error };
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
    const { difficulty, page = 1, limit: limitInput } = filters;

    const topicDoc = await AptitudeTopic.findOne({
      topic,
      isActive: true,
    }).lean();

    if (!topicDoc) {
      return {
        data: {
          questions: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 0,
            totalPages: 0,
            hasMore: false,
          },
        },
      };
    }

    let questions = topicDoc.questions || [];

    if (difficulty) {
      questions = questions.filter((q) => q.difficulty === difficulty);
    }

    const totalCount = questions.length;

    /** No limit → return full topic (same idea as DSA topic fetch). */
    if (limitInput === undefined || limitInput === null) {
      return {
        data: {
          questions,
          pagination: {
            total: totalCount,
            page: 1,
            limit: totalCount,
            totalPages: 1,
            hasMore: false,
          },
        },
      };
    }

    const paginatedQuestions = questions.slice(
      (page - 1) * limitInput,
      page * limitInput,
    );

    return {
      data: {
        questions: paginatedQuestions,
        pagination: {
          total: totalCount,
          page,
          limit: limitInput,
          totalPages: Math.ceil(totalCount / limitInput) || 1,
          hasMore: page * limitInput < totalCount,
        },
      },
    };
  } catch (error) {
    return { error: "Failed to fetch questions", details: error };
  }
};

const updateAptitudeQuestionInDB = async (
  topic: string,
  questionId: string,
  updates: Partial<AddAptitudeQuestionPayload & { isActive: boolean }>,
): Promise<DatabaseQueryResponseType> => {
  try {
    const topicDoc = await AptitudeTopic.findOne({ topic });
    if (!topicDoc) return { error: "Topic not found" };

    const questionIndex = topicDoc.questions.findIndex(
      (q: any) => q._id.toString() === questionId,
    );

    if (questionIndex === -1) return { error: "Question not found" };

    // Apply updates
    topicDoc.questions[questionIndex] = {
      ...topicDoc.questions[questionIndex],
      ...updates,
    } as any;

    await topicDoc.save();
    return { data: topicDoc.questions[questionIndex] };
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

    const topicDocs = await AptitudeTopic.find({
      topic: { $in: slugs },
      isActive: true,
    }).lean();

    const countMap = new Map(
      topicDocs.map((doc) => [doc.topic, doc.questions?.length || 0]),
    );

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

      const results = await AptitudeTopic.aggregate([
        { $match: { isActive: true } },
        { $project: { questionCount: { $size: "$questions" } } },
        { $group: { _id: null, total: { $sum: "$questionCount" } } },
      ]);

      const totalQuestions = results[0]?.total || 0;

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

/**
 * Merge-based bulk upload: adds new questions, updates existing (matched by question text), never deletes.
 * Preserves _id of existing questions so any references remain valid.
 */
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

    let topicDoc = await AptitudeTopic.findOne({ topic });

    if (!topicDoc) {
      topicDoc = new AptitudeTopic({ topic, questions, contentId: uuidv4() });
      await topicDoc.save();
      return {
        data: {
          topic,
          questionsAdded: questions.length,
          questionsUpdated: 0,
          totalQuestions: topicDoc.questions.length,
        },
      };
    }

    const existingMap = new Map(
      topicDoc.questions.map((q: any) => [q.question, q]),
    );

    let added = 0;
    let updated = 0;

    for (const incoming of questions) {
      const existing = existingMap.get(incoming.question);

      if (existing) {
        if (incoming.answer !== undefined) existing.answer = incoming.answer;
        if (incoming.options !== undefined) existing.options = incoming.options;
        if (incoming.difficulty !== undefined)
          existing.difficulty = incoming.difficulty;
        if (incoming.order !== undefined) existing.order = incoming.order;
        updated++;
      } else {
        topicDoc.questions.push(incoming as any);
        added++;
      }
    }

    await topicDoc.save();

    return {
      data: {
        topic,
        questionsAdded: added,
        questionsUpdated: updated,
        totalQuestions: topicDoc.questions.length,
      },
    };
  } catch (error) {
    logger.error("DB: bulkUploadAptitudeDataToDB failed", {
      topic: payload.topic,
      questionCount: payload.questions?.length,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to bulk upload aptitude data", details: error };
  }
};

// ─── Study Guide Queries ─────────────────────────────────────────────────────

const getAptitudeStudyGuideByTopicFromDB = async (
  topic: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const topicDoc = await AptitudeTopic.findOne({ topic }).lean();
    if (!topicDoc || !topicDoc.studyGuide) {
      return { data: null };
    }
    return { data: { content: topicDoc.studyGuide, topic: topicDoc.topic } };
  } catch (error) {
    return { error: "Failed to fetch study guide", details: error };
  }
};

const upsertAptitudeStudyGuideToDB = async (
  topic: string,
  content: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    if (!APTITUDE_TOPIC_SLUGS.includes(topic)) {
      return { error: `Invalid topic slug: ${topic}` };
    }

    const updated = await AptitudeTopic.findOneAndUpdate(
      { topic },
      { $set: { studyGuide: content } },
      { new: true, upsert: true },
    );

    return { data: updated };
  } catch (error) {
    return { error: "Failed to upsert study guide", details: error };
  }
};

export {
  addAptitudeQuestionToDB,
  bulkUploadAptitudeDataToDB,
  getAptitudeMetadataFromDB,
  getAptitudeQuestionsByTopicFromDB,
  getAptitudeStudyGuideByTopicFromDB,
  getAptitudeTopicsWithQuestionCountFromDB,
  updateAptitudeQuestionInDB,
  upsertAptitudeStudyGuideToDB,
};
