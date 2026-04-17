import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS, PRODUCT_TYPE } from "@/lib/constants";
import type { SubscriptionPlanModel } from "@/lib/interfaces";

const SubscriptionPlanSchema = new Schema<SubscriptionPlanModel>(
  {
    /**
     * Stable external id for the same logical plan across environments (staging/prod)
     * and for migrations. Prefer explicit values in seed JSON; otherwise derived in code.
     */
    planUuid: {
      type: String,
      trim: true,
    },
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
    displayName: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    amountInr: {
      type: Number,
      required: true,
      min: 0,
    },
    /** Original price before discount (for strike-through pricing). 0 = no original price. */
    originalAmountInr: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    /** Access type: ONE_TIME = single purchase, SUBSCRIPTION = duration-based */
    accessType: {
      type: String,
      enum: ["ONE_TIME", "SUBSCRIPTION"],
      default: "SUBSCRIPTION",
    },
    /** Duration in months (0 = lifetime) */
    durationMonths: {
      type: Number,
      default: 0,
      min: 0,
    },
    /** Feature list shown on pricing cards */
    features: {
      type: [String],
      default: [],
    },
    /** Whether this plan is highlighted / recommended */
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    /** Sort order for pricing page display */
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

SubscriptionPlanSchema.index({ productType: 1, planKey: 1 }, { unique: true });
/** One canonical UUID per plan (sparse: legacy docs without planUuid remain valid). */
SubscriptionPlanSchema.index({ planUuid: 1 }, { unique: true, sparse: true });

const SubscriptionPlan: Model<SubscriptionPlanModel> =
  models?.SubscriptionPlan ||
  model<SubscriptionPlanModel>(
    DATABASE_MODELS.SUBSCRIPTION_PLAN,
    SubscriptionPlanSchema,
  );

export default SubscriptionPlan;
