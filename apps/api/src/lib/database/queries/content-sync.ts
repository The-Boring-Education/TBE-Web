import type { DatabaseQueryResponseType } from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { AptitudeTopic, DSAQuestion, InterviewSheet, Quiz } from "../models";

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
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

export {
  exportAptitudeTopicsFromDB,
  exportDSAQuestionsFromDB,
  exportInterviewSheetsFromDB,
  exportQuizzesFromDB,
};
