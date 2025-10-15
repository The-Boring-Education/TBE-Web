import type { Document,Model } from 'mongoose';
import { model, models, Schema } from 'mongoose';

import { DATABASE_MODELS } from '@/constant';

// Define the document interface
interface IChallengeLog extends Document {
  challenge: Schema.Types.ObjectId;
  day: number;
  progressText: string;
  hoursSpent: number;
  nextGoals: string[];
  loggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeLogSchema = new Schema<IChallengeLog>(
  {
    challenge: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.CHALLENGE,
      required: true,
      index: true,
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
    },
    hoursSpent: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
    },
    nextGoals: [
      {
        type: String,
        trim: true,
      },
    ],
    loggedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index to ensure one log per day per challenge
ChallengeLogSchema.index({ challenge: 1, day: 1 }, { unique: true });

const ChallengeLog: Model<IChallengeLog> =
  models?.ChallengeLog ||
  model<IChallengeLog>(DATABASE_MODELS.CHALLENGE_LOG, ChallengeLogSchema);

export default ChallengeLog;
