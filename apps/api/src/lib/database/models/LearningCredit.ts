import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS, USER_POINTS_ACTION } from "@/lib/constants";
import type { LearningCreditModel } from "@/lib/interfaces";

/**
 * Whether a learner's Learning Action on a Learning Item currently counts toward
 * Period Score. Enforces "at most once per item, ever" (see CONTEXT.md).
 */
const LearningCreditSchema = new Schema<LearningCreditModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: true,
    },
    actionType: { type: String, enum: USER_POINTS_ACTION, required: true },
    itemId: { type: String, required: true },
    credited: { type: Boolean, required: true },
    creditedAt: { type: Date },
  },
  { timestamps: true },
);

LearningCreditSchema.index(
  { userId: 1, actionType: 1, itemId: 1 },
  { unique: true },
);

const LearningCredit: Model<LearningCreditModel> =
  models[DATABASE_MODELS.LEARNING_CREDIT] ||
  model<LearningCreditModel>(
    DATABASE_MODELS.LEARNING_CREDIT,
    LearningCreditSchema,
  );

export default LearningCredit;
