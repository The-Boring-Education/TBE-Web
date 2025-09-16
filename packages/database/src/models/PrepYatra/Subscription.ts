import { type Model, model, models, Schema } from 'mongoose';

import {
  DATABASE_MODELS,
  SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_TYPES,
} from '@tbe/constants';
import type { PrepYatraSubscriptionModel } from '@tbe/interface';

const PrepYatraSubscriptionSchema = new Schema<PrepYatraSubscriptionModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: SUBSCRIPTION_TYPES,
      required: [true, 'Subscription type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration in months is required'],
    },
    startDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
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
  }
);

// Index for efficient queries
PrepYatraSubscriptionSchema.index({ userId: 1, isActive: 1 });
PrepYatraSubscriptionSchema.index({ expiryDate: 1 });

const PrepYatraSubscription: Model<PrepYatraSubscriptionModel> =
  models?.PrepYatraSubscription ||
  model<PrepYatraSubscriptionModel>(
    DATABASE_MODELS.PREP_YATRA_SUBSCRIPTION,
    PrepYatraSubscriptionSchema
  );

export default PrepYatraSubscription;
