import type { DatabaseQueryResponseType } from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { AptitudeTopic, UserAptitudeTopic } from "../models";
import { toObjectId } from "./common";

/**
 * Attach `isCompleted` from UserAptitudeTopic for each question (API response shape).
 */
const mergeAptitudeProgressIntoQuestions = async <T extends { _id?: unknown }>(
  questions: T[],
  userId: string | undefined,
  topicSlug: string,
): Promise<Array<T & { isCompleted: boolean }>> => {
  if (!userId || questions.length === 0) {
    return questions.map((q) => ({ ...q, isCompleted: false }));
  }

  try {
    const doc = await UserAptitudeTopic.findOne({
      userId: toObjectId(userId),
      topicSlug,
    }).lean();

    const completed = new Map<string, boolean>();
    for (const row of doc?.questions || []) {
      completed.set(String(row.questionId), !!row.isCompleted);
    }

    return questions.map((q) => ({
      ...q,
      isCompleted: completed.get(String(q._id)) ?? false,
    }));
  } catch (error) {
    logger.error("mergeAptitudeProgressIntoQuestions failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return questions.map((q) => ({ ...q, isCompleted: false }));
  }
};

const markAptitudeQuestionCompletedByUser = async (
  userId: string,
  topicSlug: string,
  questionId: string,
  isCompleted: boolean,
): Promise<DatabaseQueryResponseType> => {
  try {
    const topicDoc = await AptitudeTopic.findOne({
      topic: topicSlug,
      isActive: true,
    }).lean();

    if (!topicDoc) {
      return { error: "Topic not found" };
    }

    const qid = toObjectId(questionId);
    const exists = topicDoc.questions?.some((q: { _id: unknown }) =>
      q._id ? String(q._id) === String(qid) : false,
    );
    if (!exists) {
      return { error: "Question not found for topic" };
    }

    const uid = toObjectId(userId);

    let updated = await UserAptitudeTopic.findOneAndUpdate(
      { userId: uid, topicSlug, "questions.questionId": qid },
      { $set: { "questions.$.isCompleted": isCompleted } },
      { new: true },
    );

    if (!updated) {
      updated = await UserAptitudeTopic.findOneAndUpdate(
        { userId: uid, topicSlug },
        { $push: { questions: { questionId: qid, isCompleted } } },
        { new: true },
      );
    }

    if (!updated) {
      updated = await UserAptitudeTopic.create({
        userId: uid,
        topicSlug,
        questions: [{ questionId: qid, isCompleted }],
      });
    }

    return { data: updated };
  } catch (error) {
    logger.error("DB: markAptitudeQuestionCompletedByUser failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to mark aptitude question", details: error };
  }
};

export {
  markAptitudeQuestionCompletedByUser,
  mergeAptitudeProgressIntoQuestions,
};
