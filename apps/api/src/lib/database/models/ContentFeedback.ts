import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS, FEEDBACK_TYPES } from "@/lib/constants";
import type { ContentFeedbackModel } from "@/lib/interfaces";

const ContentFeedbackSchema: Schema<ContentFeedbackModel> = new Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },

    contentType: {
      type: String,
      required: [true, "Content type is required"],
      enum: FEEDBACK_TYPES,
    },

    contentId: {
      type: String,
      required: [true, "Content ID is required"],
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
    },

    reviewText: {
      type: String,
      default: "",
    },

    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// Enforce one feedback per user per content item; enables upsert
ContentFeedbackSchema.index(
  { userId: 1, contentType: 1, contentId: 1 },
  { unique: true },
);

const ContentFeedback: Model<ContentFeedbackModel> =
  (models[DATABASE_MODELS.CONTENT_FEEDBACK] as Model<ContentFeedbackModel>) ||
  model<ContentFeedbackModel>(
    DATABASE_MODELS.CONTENT_FEEDBACK,
    ContentFeedbackSchema,
  );

export default ContentFeedback;
