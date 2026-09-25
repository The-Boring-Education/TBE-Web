import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS, USER_POINTS_ACTION } from "@/lib/constants";
import type { LearningCreditModel } from "@/lib/interfaces";

/**
 * A learner's state for one Learning Action on one Learning Item (see CONTEXT.md):
 * `completed` drives Lifetime Points (they move only when it flips) and
 * `credited` drives Period Score, so an item's net contribution never exceeds its value.
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
    completed: { type: Boolean, required: true, default: false },
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
