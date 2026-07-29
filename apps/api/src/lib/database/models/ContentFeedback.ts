import { type Model, model, models, Schema } from "mongoose";

import {
  CONTENT_FEEDBACK_KINDS,
  CONTENT_FEEDBACK_STATUSES,
  CONTENT_FEEDBACK_TYPES,
  DATABASE_MODELS,
} from "@/lib/constants";
import type { ContentFeedbackModel } from "@/lib/interfaces";

/**
 * Generic content-feedback collection.
 *
 * One document per user submission. The (contentType, contentId) tuple
 * identifies the referenced content, allowing the same collection to serve
 * every content surface (DSA questions, courses, quizzes, webinars, etc.)
 * without a schema migration when a new type is added.
 */
const ContentFeedbackSchema: Schema<ContentFeedbackModel> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, "userId is required"],
      index: true,
    },
    contentType: {
      type: String,
      required: [true, "contentType is required"],
      enum: CONTENT_FEEDBACK_TYPES,
      index: true,
    },
    contentId: {
      type: String,
      required: [true, "contentId is required"],
      index: true,
    },
    feedbackKind: {
      type: String,
      required: [true, "feedbackKind is required"],
      enum: CONTENT_FEEDBACK_KINDS,
    },
    rating: {
      type: Number,
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
    },
    message: {
      type: String,
      required: [true, "message is required"],
      minlength: [5, "message must be at least 5 characters"],
      maxlength: [2000, "message must be at most 2000 characters"],
      trim: true,
    },
    suggestedEdit: {
      type: String,
      maxlength: [5000, "suggestedEdit must be at most 5000 characters"],
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: CONTENT_FEEDBACK_STATUSES,
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  },
);

ContentFeedbackSchema.index({ contentType: 1, contentId: 1, createdAt: -1 });

const ContentFeedback: Model<ContentFeedbackModel> =
  models?.ContentFeedback ||
  model<ContentFeedbackModel>(
    DATABASE_MODELS.CONTENT_FEEDBACK,
    ContentFeedbackSchema,
  );

export default ContentFeedback;
