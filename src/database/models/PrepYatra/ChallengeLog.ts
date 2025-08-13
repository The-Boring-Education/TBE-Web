import { type Model, model, models, Schema } from 'mongoose';

import { DATABASE_MODELS } from '@/constant';
import type { ChallengeLogModel } from '@/interfaces';

const ChallengeLogSchema = new Schema<ChallengeLogModel>(
  {
    challenge: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.CHALLENGE,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: true,
    },
    day: {
      type: Number,
      required: true,
      min: 1,
    },
    progressText: {
      type: String,
      required: true,
      trim: true,
      maxLength: 500,
    },
    hoursSpent: {
      type: Number,
      required: true,
      min: 0.5,
      max: 24,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    copiedToPrepLogs: {
      type: Boolean,
      default: false,
    },
    prepLogId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.PREP_LOG,
    },
    gamificationPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Add indexes for performance
ChallengeLogSchema.index({ challenge: 1, day: 1 }, { unique: true });
ChallengeLogSchema.index({ user: 1, date: -1 });
ChallengeLogSchema.index({ challenge: 1, createdAt: -1 });

const ChallengeLog: Model<ChallengeLogModel> =
  models?.ChallengeLog ||
  model<ChallengeLogModel>(DATABASE_MODELS.CHALLENGE_LOG, ChallengeLogSchema);

export default ChallengeLog;