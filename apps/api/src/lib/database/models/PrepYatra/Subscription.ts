import { type Model, model, models, Schema } from "mongoose";

import {
  DATABASE_MODELS,
  SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_TYPES,
} from "@/lib/constants";
import { PRODUCT_TYPE } from "@/lib/constants/database";
import type { PrepYatraSubscriptionModel } from "@/lib/interfaces";

const SubscriptionSchema = new Schema<PrepYatraSubscriptionModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, "User ID is required"],
      index: true,
    },
    type: {
      type: String,
      enum: SUBSCRIPTION_TYPES,
      required: [true, "Subscription type is required"],
    },
    productType: {
      type: String,
      enum: PRODUCT_TYPE,
      // Optional for backward-compat with legacy subscriptions.
      // New subscriptions always include productType; legacy rows need a one-time migration.
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration in months is required"],
    },
    startDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    features: {
      type: [String],
      enum: SUBSCRIPTION_FEATURES,
      default: [],
    },
  },
  {
    timestamps: true,
    _id: true,
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
  },
);

// Index for efficient queries
SubscriptionSchema.index({ userId: 1, isActive: 1 });
SubscriptionSchema.index({ expiryDate: 1 });

const Subscription: Model<PrepYatraSubscriptionModel> =
  models?.[DATABASE_MODELS.SUBSCRIPTIONS] ||
  model<PrepYatraSubscriptionModel>(
    DATABASE_MODELS.SUBSCRIPTIONS,
    SubscriptionSchema,
  );

export default Subscription;
