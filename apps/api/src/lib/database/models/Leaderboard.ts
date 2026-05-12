import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS, LeaderboardEnum, TBE_APP } from "@/lib/constants";
import { type LeaderboardModel } from "@/lib/interfaces";

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
  { _id: false },
);

const LeaderboardSchema = new Schema(
  {
    type: {
      type: String,
      enum: LeaderboardEnum,
      required: true,
    },
    app: {
      type: String,
      enum: TBE_APP,
      required: false,
      default: null,
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
  { timestamps: true },
);

// Compound index so each (type, app) pair has exactly one leaderboard document
LeaderboardSchema.index({ type: 1, app: 1 }, { unique: true, sparse: false });

const Leaderboard: Model<LeaderboardModel> =
  models[DATABASE_MODELS.LEADERBOARD] ||
  model<LeaderboardModel>(DATABASE_MODELS.LEADERBOARD, LeaderboardSchema);

export default Leaderboard;
