import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS, PRODUCT_TYPE } from "@/lib/constants";
import type { SubscriptionPlanModel } from "@/lib/interfaces";

const SubscriptionPlanSchema = new Schema<SubscriptionPlanModel>(
  {
    productType: {
      type: String,
      enum: PRODUCT_TYPE,
      required: true,
    },
    planKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    amountInr: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

SubscriptionPlanSchema.index(
  { productType: 1, planKey: 1 },
  { unique: true },
);

const SubscriptionPlan: Model<SubscriptionPlanModel> =
  models?.SubscriptionPlan ||
  model<SubscriptionPlanModel>(
    DATABASE_MODELS.SUBSCRIPTION_PLAN,
    SubscriptionPlanSchema,
  );

export default SubscriptionPlan;
