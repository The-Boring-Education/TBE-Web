import fs from "fs";

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
    const { difficulty, page = 1, limit = 50 } = filters;

    const topicDoc = await AptitudeTopic.findOne({
      topic,
      isActive: true,
    }).lean();

    if (!topicDoc) {
      return {
        data: {
          questions: [],
          pagination: { total: 0, page, limit, totalPages: 0, hasMore: false },
        },
      };
    }

    let questions = topicDoc.questions || [];

    if (difficulty) {
      questions = questions.filter((q) => q.difficulty === difficulty);
    }

    const totalCount = questions.length;
    const paginatedQuestions = questions.slice(
      (page - 1) * limit,
      page * limit,
    );

    return {
      data: {
        questions: paginatedQuestions,
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
 * Consolidated bulk upload: Updates exactly one AptitudeTopic document
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

    const updated = await AptitudeTopic.findOneAndUpdate(
      { topic },
      { $set: { questions } },
      { new: true, upsert: true },
    );

    return { data: { topic, questionsInserted: updated.questions.length } };
  } catch (error) {
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

// ─── Migration Helper ────────────────────────────────────────────────────────

const migrateExistingAptitudeData =
  async (): Promise<DatabaseQueryResponseType> => {
    const logFile = "migration.log"; // Define logFile here
    const log = (msg: string) => {
      console.log(`[Migration] ${msg}`);
      try {
        fs.appendFileSync(logFile, msg + "\n");
      } catch (e) {
        console.error(`Failed to write to log file: ${e}`);
      }
    };

    try {
      fs.writeFileSync(logFile, "Starting migration...\n");
      const db = AptitudeTopic.db;
      const guides = await db
        .collection("aptitudestudyguides")
        .find({})
        .toArray();
      const allQuestions = await db
        .collection("aptitudequestions")
        .find({})
        .toArray();

      log(`Found ${guides.length} guides and ${allQuestions.length} questions`);

      const results = [];

      for (const slug of APTITUDE_TOPIC_SLUGS) {
        const topicGuide = guides.find((g: any) => g.topic === slug);
        const topicQuestions = allQuestions
          .filter((q: any) => q.topic === slug)
          .map((q: any) => {
            const { topic: _unused, _id, ...rest } = q;
            return rest;
          });

        if (topicGuide || topicQuestions.length > 0) {
          log(
            `Migrating topic: ${slug} (${topicQuestions.length} questions, guide: ${!!topicGuide})`,
          );
          const updated = await AptitudeTopic.findOneAndUpdate(
            { topic: slug },
            {
              $set: {
                studyGuide: topicGuide?.content || "",
                questions: topicQuestions,
              },
            },
            { new: true, upsert: true },
          );
          results.push({
            topic: slug,
            questions: updated.questions.length,
            hasGuide: !!updated.studyGuide,
          });
        }
      }

      log(`Migration complete. Migrated ${results.length} topics.`);
      return { data: { migratedTopics: results.length, details: results } };
    } catch (error) {
      log(`Migration failed: ${error}`);
      return { error: "Migration failed", details: error };
    }
  };

export {
  addAptitudeQuestionToDB,
  bulkUploadAptitudeDataToDB,
  getAptitudeMetadataFromDB,
  getAptitudeQuestionsByTopicFromDB,
  getAptitudeStudyGuideByTopicFromDB,
  getAptitudeTopicsWithQuestionCountFromDB,
  migrateExistingAptitudeData,
  updateAptitudeQuestionInDB,
  upsertAptitudeStudyGuideToDB,
};
