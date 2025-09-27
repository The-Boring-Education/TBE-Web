import { type Model, model, models, Schema } from 'mongoose';

import { DATABASE_MODELS, INTEREST_EVENT_TYPES } from '@/lib/constants';
import type { UserInterestModel } from '@/lib/interfaces';

const UserInterestSchema = new Schema<UserInterestModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, 'User ID is required'],
      index: true,
    },
    eventType: {
      type: String,
      enum: INTEREST_EVENT_TYPES,
      required: [true, 'Event type is required'],
      index: true,
    },
    eventDescription: {
      type: String,
      trim: true,
      maxlength: [500, 'Event description cannot exceed 500 characters'],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    source: {
      type: String,
      enum: ['WEBAPP', 'PREPYATRA', 'ADMIN', 'API'],
      required: [true, 'Source is required'],
      index: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
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

// Compound indexes for efficient queries
UserInterestSchema.index({ userId: 1, eventType: 1 });
UserInterestSchema.index({ eventType: 1, source: 1 });
UserInterestSchema.index({ createdAt: -1 });
UserInterestSchema.index({ userId: 1, isActive: 1 });

// Prevent duplicate interests for the same user and event type
UserInterestSchema.index(
  { userId: 1, eventType: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

const UserInterest: Model<UserInterestModel> =
  models?.UserInterest ||
  model<UserInterestModel>(
    DATABASE_MODELS.USER_INTEREST,
    UserInterestSchema
  );

export default UserInterest;