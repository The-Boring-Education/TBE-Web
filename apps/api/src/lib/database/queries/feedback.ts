import type {
  AddFeedbackRequestProps,
  DatabaseQueryResponseType,
  UpdateFeedbackRequestProps,
} from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { Feedback } from "../models";

const addFeedbackToDB = async ({
  rating,
  type,
  ref,
  userId,
}: AddFeedbackRequestProps): Promise<DatabaseQueryResponseType> => {
  try {
    const newFeedback = new Feedback({
      rating,
      type,
      ref,
      user: userId,
      feedback: "",
    });

    await newFeedback.save();
    return { data: newFeedback };
  } catch (error) {
    logger.error("DB: addFeedbackToDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to create feedback", details: error };
  }
};

const updateFeedbackTextInDB = async ({
  feedbackId,
  userId,
  feedback,
}: UpdateFeedbackRequestProps): Promise<DatabaseQueryResponseType> => {
  try {
    const existingFeedback = await Feedback.findOne({
      _id: feedbackId,
      user: userId,
    });

    if (!existingFeedback) {
      return { error: "Feedback not found" };
    }

    existingFeedback.feedback = feedback;
    await existingFeedback.save();
    return { data: existingFeedback };
  } catch (error) {
    logger.error("DB: updateFeedbackTextInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to update feedback text", details: error };
  }
};

export { addFeedbackToDB, updateFeedbackTextInDB };
