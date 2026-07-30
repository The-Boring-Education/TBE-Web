import type { FeedbackType } from "@/lib/constants";
import type { DatabaseQueryResponseType } from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { ContentFeedback } from "../models";

export interface ContentFeedbackData {
  hasReviewed: boolean;
  rating: number | null;
  reviewText: string;
  meta?: Record<string, unknown> | null;
  updatedAt: Date | null;
}

/**
 * Fetches the current user's feedback for a specific content item.
 */
const getContentFeedbackFromDB = async (
  userId: string,
  contentType: FeedbackType,
  contentId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const feedback = await ContentFeedback.findOne({
      userId,
      contentType,
      contentId,
    }).lean();

    if (!feedback) {
      const result: ContentFeedbackData = {
        hasReviewed: false,
        rating: null,
        reviewText: "",
        meta: null,
        updatedAt: null,
      };
      return { data: result };
    }

    const result: ContentFeedbackData = {
      hasReviewed: true,
      rating: feedback.rating,
      reviewText: feedback.reviewText ?? "",
      meta: (feedback as any).meta ?? null,
      updatedAt: feedback.updatedAt,
    };
    return { data: result };
  } catch (error) {
    logger.error("DB: getContentFeedbackFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to fetch content feedback", details: error };
  }
};

/**
 * Creates or updates (upserts) feedback for a specific content item.
 * The unique compound index on { userId, contentType, contentId } ensures
 * one record per user per content item.
 */
const upsertContentFeedbackInDB = async (
  userId: string,
  contentType: FeedbackType,
  contentId: string,
  rating: number,
  reviewText: string = "",
  meta?: Record<string, unknown>,
): Promise<DatabaseQueryResponseType> => {
  try {
    const updatePayload: Record<string, any> = { rating, reviewText };
    if (meta && typeof meta === "object" && Object.keys(meta).length > 0) {
      updatePayload.meta = meta;
    }

    const feedback = await ContentFeedback.findOneAndUpdate(
      { userId, contentType, contentId },
      { $set: updatePayload },
      { upsert: true, new: true, runValidators: true },
    );

    return { data: feedback };
  } catch (error) {
    logger.error("DB: upsertContentFeedbackInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to save content feedback", details: error };
  }
};

export { getContentFeedbackFromDB, upsertContentFeedbackInDB };
