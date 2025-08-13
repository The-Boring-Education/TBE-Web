import { type Model, model, models, Schema } from 'mongoose';

import { DATABASE_MODELS } from '@/constant';
import type { ChallengeModel } from '@/interfaces';

const ChallengeSchema = new Schema<ChallengeModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    totalDays: {
      type: Number,
      required: true,
      min: 1,
      max: 365,
    },
    currentDay: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'cancelled'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    isPredefined: {
      type: Boolean,
      default: false,
    },
    predefinedType: {
      type: String,
      enum: ['21DaysPython', '21DaysJava', '50DaysInternship'],
    },
    gamificationPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Add indexes for performance
ChallengeSchema.index({ user: 1, status: 1 });
ChallengeSchema.index({ user: 1, createdAt: -1 });

const Challenge: Model<ChallengeModel> =
  models?.Challenge ||
  model<ChallengeModel>(DATABASE_MODELS.CHALLENGE, ChallengeSchema);

export default Challenge;