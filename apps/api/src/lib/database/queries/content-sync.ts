import type { DatabaseQueryResponseType } from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { AptitudeTopic, DSAQuestion, InterviewSheet, Quiz } from "../models";

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
      error: error instanceof Error ? error.message : String(error),
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
      error: error instanceof Error ? error.message : String(error),
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
      error: error instanceof Error ? error.message : String(error),
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
      error: error instanceof Error ? error.message : String(error),
    });
    return { error: "Failed to export quizzes", details: error };
  }
};

// ─── Sync (Upsert) Queries ──────────────────────────────────────────────────

/**
 * Sync DSA questions: upsert by title. Preserves _id of existing questions.
 * New questions get fresh _ids. Existing questions get their fields updated.
 */
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
          if (q.answer !== undefined) existing.answer = q.answer;
          if (q.domain !== undefined) existing.domain = q.domain;
          if (q.difficulty !== undefined) existing.difficulty = q.difficulty;
          if (q.companyTypes !== undefined)
            existing.companyTypes = q.companyTypes;
          if (q.topics !== undefined) existing.topics = q.topics;
          if (q.order !== undefined) existing.order = q.order;
          if (q.resources !== undefined) existing.resources = q.resources;
          await existing.save();
          updated++;
        } else {
          const newQ = new DSAQuestion(q);
          await newQ.save();
          added++;
        }
      } catch (qError) {
        const msg = `Question "${q.title}": ${qError instanceof Error ? qError.message : String(qError)}`;
        errors.push(msg);
        logger.warn("syncDSAQuestionsToDB: question error", { error: msg });
      }
    }

    return {
      data: {
        added,
        updated,
        failed: errors.length,
        total: questions.length,
        errors: errors.slice(0, 10),
      },
    };
  } catch (error) {
    logger.error("DB: syncDSAQuestionsToDB failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { error: "Failed to sync DSA questions", details: error };
  }
};

/**
 * Sync interview sheets: upsert by slug. Preserves _id and embedded question _ids.
 * For existing sheets: updates metadata, merges questions (match by title).
 */
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
          if (sheet.name !== undefined) existing.name = sheet.name;
          if (sheet.description !== undefined)
            existing.description = sheet.description;
          if (sheet.meta !== undefined) existing.meta = sheet.meta;
          if (sheet.coverImageURL !== undefined)
            existing.coverImageURL = sheet.coverImageURL;
          if (sheet.roadmap !== undefined) existing.roadmap = sheet.roadmap;
          if (sheet.isPremium !== undefined)
            existing.isPremium = sheet.isPremium;
          if (sheet.price !== undefined) existing.price = sheet.price;
          if (sheet.features !== undefined) existing.features = sheet.features;

          if (sheet.questions?.length) {
            const existingQMap = new Map(
              (existing.questions || []).map((q: any) => [q.title, q]),
            );

            for (const incomingQ of sheet.questions) {
              const existingQ = existingQMap.get(incomingQ.title);
              if (existingQ) {
                if (incomingQ.question !== undefined)
                  existingQ.question = incomingQ.question;
                if (incomingQ.answer !== undefined)
                  existingQ.answer = incomingQ.answer;
                if (incomingQ.frequency !== undefined)
                  existingQ.frequency = incomingQ.frequency;
                if (incomingQ.priority !== undefined)
                  existingQ.priority = incomingQ.priority;
                if (incomingQ.companyTypes !== undefined)
                  existingQ.companyTypes = incomingQ.companyTypes;
                if (incomingQ.resources !== undefined)
                  existingQ.resources = incomingQ.resources;
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
          const newSheet = new InterviewSheet(sheet);
          await newSheet.save();
          added++;
        }
      } catch (sError) {
        const msg = `Sheet "${sheet.slug}": ${sError instanceof Error ? sError.message : String(sError)}`;
        errors.push(msg);
        logger.warn("syncInterviewSheetsToDB: sheet error", { error: msg });
      }
    }

    return {
      data: {
        added,
        updated,
        failed: errors.length,
        total: sheets.length,
        errors: errors.slice(0, 10),
      },
    };
  } catch (error) {
    logger.error("DB: syncInterviewSheetsToDB failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { error: "Failed to sync interview sheets", details: error };
  }
};

/**
 * Sync quizzes: upsert by categoryName.
 * For existing quizzes: updates metadata, merges questions (match by question text).
 */
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
          if (quiz.categoryDescription !== undefined)
            existing.categoryDescription = quiz.categoryDescription;
          if (quiz.categoryIcon !== undefined)
            existing.categoryIcon = quiz.categoryIcon;
          if (quiz.isActive !== undefined) existing.isActive = quiz.isActive;

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
          const newQuiz = new Quiz(quiz);
          await newQuiz.save();
          added++;
        }
      } catch (qError) {
        const msg = `Quiz "${quiz.categoryName}": ${qError instanceof Error ? qError.message : String(qError)}`;
        errors.push(msg);
        logger.warn("syncQuizzesToDB: quiz error", { error: msg });
      }
    }

    return {
      data: {
        added,
        updated,
        failed: errors.length,
        total: quizzes.length,
        errors: errors.slice(0, 10),
      },
    };
  } catch (error) {
    logger.error("DB: syncQuizzesToDB failed", {
      error: error instanceof Error ? error.message : String(error),
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
