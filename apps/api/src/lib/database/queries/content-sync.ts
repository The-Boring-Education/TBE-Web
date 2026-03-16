import type { DatabaseQueryResponseType } from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { AptitudeTopic, DSAQuestion, InterviewSheet, Quiz } from "../models";

// ─── Shared Helpers ─────────────────────────────────────────────────────────

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function applyDefinedFields(
  target: Record<string, any>,
  source: Record<string, any>,
  fields: string[],
): void {
  for (const field of fields) {
    if (source[field] !== undefined) {
      target[field] = source[field];
    }
  }
}

function buildSyncResult(
  added: number,
  updated: number,
  errors: string[],
  total: number,
) {
  return {
    added,
    updated,
    failed: errors.length,
    total,
    errors: errors.slice(0, 10),
  };
}

// ─── Export Queries ──────────────────────────────────────────────────────────

const exportDSAQuestionsFromDB = async (filters: {
  topics?: string[];
  domain?: string[];
  difficulty?: string[];
}): Promise<DatabaseQueryResponseType> => {
  try {
    const match: any = {};
    if (filters.topics?.length) match.topics = { $in: filters.topics };
    if (filters.domain?.length) match.domain = { $in: filters.domain };
    if (filters.difficulty?.length)
      match.difficulty = { $in: filters.difficulty };

    const questions = await DSAQuestion.find(match).sort({ order: 1 }).lean();
    return { data: { questions, count: questions.length } };
  } catch (error) {
    logger.error("DB: exportDSAQuestionsFromDB failed", {
      error: toErrorMessage(error),
    });
    return { error: "Failed to export DSA questions", details: error };
  }
};

const exportInterviewSheetsFromDB = async (filters: {
  slugs?: string[];
  roadmap?: string;
}): Promise<DatabaseQueryResponseType> => {
  try {
    const match: any = {};
    if (filters.slugs?.length) match.slug = { $in: filters.slugs };
    if (filters.roadmap) match.roadmap = filters.roadmap;

    const sheets = await InterviewSheet.find(match).lean();
    return { data: { sheets, count: sheets.length } };
  } catch (error) {
    logger.error("DB: exportInterviewSheetsFromDB failed", {
      error: toErrorMessage(error),
    });
    return { error: "Failed to export interview sheets", details: error };
  }
};

const exportAptitudeTopicsFromDB = async (filters: {
  topics?: string[];
}): Promise<DatabaseQueryResponseType> => {
  try {
    const match: any = { isActive: true };
    if (filters.topics?.length) match.topic = { $in: filters.topics };

    const topics = await AptitudeTopic.find(match).lean();
    return { data: { topics, count: topics.length } };
  } catch (error) {
    logger.error("DB: exportAptitudeTopicsFromDB failed", {
      error: toErrorMessage(error),
    });
    return { error: "Failed to export aptitude topics", details: error };
  }
};

const exportQuizzesFromDB = async (filters: {
  categoryNames?: string[];
}): Promise<DatabaseQueryResponseType> => {
  try {
    const match: any = {};
    if (filters.categoryNames?.length)
      match.categoryName = { $in: filters.categoryNames };

    const quizzes = await Quiz.find(match).lean();
    return { data: { quizzes, count: quizzes.length } };
  } catch (error) {
    logger.error("DB: exportQuizzesFromDB failed", {
      error: toErrorMessage(error),
    });
    return { error: "Failed to export quizzes", details: error };
  }
};

// ─── Sync (Upsert) Queries ──────────────────────────────────────────────────

/**
 * Sync DSA questions: upsert by title. Preserves _id of existing questions.
 * New questions get fresh _ids. Existing questions get their fields updated.
 */
const DSA_QUESTION_SYNC_FIELDS = [
  "answer",
  "domain",
  "difficulty",
  "companyTypes",
  "topics",
  "order",
  "resources",
] as const;

const syncDSAQuestionsToDB = async (
  questions: any[],
): Promise<DatabaseQueryResponseType> => {
  try {
    let added = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const q of questions) {
      try {
        const existing = await DSAQuestion.findOne({ title: q.title });

        if (existing) {
          applyDefinedFields(existing, q, [...DSA_QUESTION_SYNC_FIELDS]);
          await existing.save();
          updated++;
        } else {
          await new DSAQuestion(q).save();
          added++;
        }
      } catch (qError) {
        const msg = `Question "${q.title}": ${toErrorMessage(qError)}`;
        errors.push(msg);
        logger.warn("syncDSAQuestionsToDB: question error", { error: msg });
      }
    }

    return { data: buildSyncResult(added, updated, errors, questions.length) };
  } catch (error) {
    logger.error("DB: syncDSAQuestionsToDB failed", {
      error: toErrorMessage(error),
    });
    return { error: "Failed to sync DSA questions", details: error };
  }
};

/**
 * Sync interview sheets: upsert by slug. Preserves _id and embedded question _ids.
 * For existing sheets: updates metadata, merges questions (match by title).
 */
const SHEET_METADATA_SYNC_FIELDS = [
  "name",
  "description",
  "meta",
  "coverImageURL",
  "roadmap",
  "isPremium",
  "price",
  "features",
] as const;

const SHEET_QUESTION_SYNC_FIELDS = [
  "question",
  "answer",
  "frequency",
  "priority",
  "companyTypes",
  "resources",
] as const;

const syncInterviewSheetsToDB = async (
  sheets: any[],
): Promise<DatabaseQueryResponseType> => {
  try {
    let added = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const sheet of sheets) {
      try {
        const existing = await InterviewSheet.findOne({ slug: sheet.slug });

        if (existing) {
          applyDefinedFields(existing, sheet, [...SHEET_METADATA_SYNC_FIELDS]);

          if (sheet.questions?.length) {
            const existingQMap = new Map(
              (existing.questions || []).map((q: any) => [q.title, q]),
            );

            for (const incomingQ of sheet.questions) {
              const existingQ = existingQMap.get(incomingQ.title);
              if (existingQ) {
                applyDefinedFields(existingQ, incomingQ, [
                  ...SHEET_QUESTION_SYNC_FIELDS,
                ]);
              } else {
                existing.questions.push(incomingQ);
              }
            }
          }

          if (sheet.dsaQuestions?.length) {
            const existingDsaIds = new Set(
              (existing.dsaQuestions || []).map((id: any) => id.toString()),
            );
            for (const dsaId of sheet.dsaQuestions) {
              if (!existingDsaIds.has(dsaId.toString())) {
                existing.dsaQuestions.push(dsaId);
              }
            }
          }

          await existing.save();
          updated++;
        } else {
          await new InterviewSheet(sheet).save();
          added++;
        }
      } catch (sError) {
        const msg = `Sheet "${sheet.slug}": ${toErrorMessage(sError)}`;
        errors.push(msg);
        logger.warn("syncInterviewSheetsToDB: sheet error", { error: msg });
      }
    }

    return { data: buildSyncResult(added, updated, errors, sheets.length) };
  } catch (error) {
    logger.error("DB: syncInterviewSheetsToDB failed", {
      error: toErrorMessage(error),
    });
    return { error: "Failed to sync interview sheets", details: error };
  }
};

/**
 * Sync quizzes: upsert by categoryName.
 * For existing quizzes: updates metadata, merges questions (match by question text).
 */
const QUIZ_METADATA_SYNC_FIELDS = [
  "categoryDescription",
  "categoryIcon",
  "isActive",
] as const;

const syncQuizzesToDB = async (
  quizzes: any[],
): Promise<DatabaseQueryResponseType> => {
  try {
    let added = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const quiz of quizzes) {
      try {
        const existing = await Quiz.findOne({
          categoryName: quiz.categoryName,
        });

        if (existing) {
          applyDefinedFields(existing, quiz, [...QUIZ_METADATA_SYNC_FIELDS]);

          if (quiz.questions?.length) {
            const existingQTexts = new Set(
              (existing.questions || []).map((q: any) => q.question),
            );

            for (const incomingQ of quiz.questions) {
              if (!existingQTexts.has(incomingQ.question)) {
                existing.questions.push(incomingQ);
              }
            }
          }

          await existing.save();
          updated++;
        } else {
          await new Quiz(quiz).save();
          added++;
        }
      } catch (qError) {
        const msg = `Quiz "${quiz.categoryName}": ${toErrorMessage(qError)}`;
        errors.push(msg);
        logger.warn("syncQuizzesToDB: quiz error", { error: msg });
      }
    }

    return { data: buildSyncResult(added, updated, errors, quizzes.length) };
  } catch (error) {
    logger.error("DB: syncQuizzesToDB failed", {
      error: toErrorMessage(error),
    });
    return { error: "Failed to sync quizzes", details: error };
  }
};

export {
  exportAptitudeTopicsFromDB,
  exportDSAQuestionsFromDB,
  exportInterviewSheetsFromDB,
  exportQuizzesFromDB,
  syncDSAQuestionsToDB,
  syncInterviewSheetsToDB,
  syncQuizzesToDB,
};
