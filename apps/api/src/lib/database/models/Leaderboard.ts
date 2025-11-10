import { type Model, model, models, Schema } from 'mongoose';

import { DATABASE_MODELS, LeaderboardEnum } from '@/lib/constants';
import { type LeaderboardModel } from '@/lib/interfaces';

const LeaderboardEntrySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const LeaderboardSchema = new Schema(
  {
    type: {
      type: String,
      enum: LeaderboardEnum,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    entries: {
      type: [LeaderboardEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Leaderboard: Model<LeaderboardModel> =
  models[DATABASE_MODELS.LEADERBOARD] ||
  model<LeaderboardModel>(DATABASE_MODELS.LEADERBOARD, LeaderboardSchema);

export default Leaderboard;
