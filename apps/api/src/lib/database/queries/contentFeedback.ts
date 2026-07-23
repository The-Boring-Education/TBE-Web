import { Types } from "mongoose";

import type {
  CreateContentFeedbackRequestProps,
  DatabaseQueryResponseType,
  GetContentFeedbackByUserFilterProps,
  GetContentFeedbackFilterProps,
} from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { ContentFeedback } from "../models";

const createContentFeedbackToDB = async ({
  userId,
  contentType,
  contentId,
  feedbackKind,
  message,
  rating,
  suggestedEdit,
}: CreateContentFeedbackRequestProps): Promise<DatabaseQueryResponseType> => {
  try {
    if (!Types.ObjectId.isValid(userId)) {
      return { error: "Invalid userId" };
    }

    const doc = new ContentFeedback({
      userId,
      contentType,
      contentId,
      feedbackKind,
      message,
      rating,
      suggestedEdit,
    });

    await doc.save();
    return { data: doc };
  } catch (error) {
    logger.error("DB: createContentFeedbackToDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      contentType,
      contentId,
    });
    return { error: "Failed to create content feedback", details: error };
  }
};

const getContentFeedbackFromDB = async ({
  contentType,
  contentId,
}: GetContentFeedbackFilterProps): Promise<DatabaseQueryResponseType> => {
  try {
    const items = await ContentFeedback.find({ contentType, contentId })
      .sort({ createdAt: -1 })
      .lean();

    return { data: items };
  } catch (error) {
    logger.error("DB: getContentFeedbackFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      contentType,
      contentId,
    });
    return { error: "Failed to fetch content feedback", details: error };
  }
};

const getContentFeedbackByUserFromDB = async ({
  userId,
  contentType,
  contentId,
}: GetContentFeedbackByUserFilterProps): Promise<DatabaseQueryResponseType> => {
  try {
    if (!Types.ObjectId.isValid(userId)) {
      return { error: "Invalid userId" };
    }

    const items = await ContentFeedback.find({
      userId,
      contentType,
      contentId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return { data: items };
  } catch (error) {
    logger.error("DB: getContentFeedbackByUserFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      userId,
      contentType,
      contentId,
    });
    return {
      error: "Failed to fetch user content feedback",
      details: error,
    };
  }
};

export {
  createContentFeedbackToDB,
  getContentFeedbackByUserFromDB,
  getContentFeedbackFromDB,
};
