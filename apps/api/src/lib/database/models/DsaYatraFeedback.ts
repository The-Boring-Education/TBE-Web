import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS } from "@/lib/constants";
import type { DsaYatraFeedbackModel } from "@/lib/interfaces";

const DsaYatraFeedbackSchema: Schema<DsaYatraFeedbackModel> = new Schema(
  {
    userId: {
      type: String,
      required: [true, "userId is required"],
      index: true,
    },

    questionId: {
      type: String,
      required: [true, "questionId is required"],
      index: true,
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
  },
  {
    timestamps: true,
  },
);

// Enforce one feedback per user per question (used for upsert semantics)
DsaYatraFeedbackSchema.index({ userId: 1, questionId: 1 }, { unique: true });

const DsaYatraFeedback: Model<DsaYatraFeedbackModel> =
  (models?.[
    DATABASE_MODELS.DSA_YATRA_FEEDBACK
  ] as Model<DsaYatraFeedbackModel>) ||
  model<DsaYatraFeedbackModel>(
    DATABASE_MODELS.DSA_YATRA_FEEDBACK,
    DsaYatraFeedbackSchema,
  );

export default DsaYatraFeedback;
