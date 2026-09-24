import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS, LEADERBOARD_TYPES } from "@/lib/constants";
import type { PeriodScoreModel } from "@/lib/interfaces";

/** A learner's live Period Score for one Period (ADR-0001). */
const PeriodScoreSchema = new Schema<PeriodScoreModel>(
  {
    type: { type: String, enum: LEADERBOARD_TYPES, required: true },
    periodKey: { type: String, required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: true,
    },
    score: { type: Number, required: true, default: 0 },
    reachedAt: { type: Date, required: true },
    backfilled: { type: Number },
  },
  { timestamps: true },
);

PeriodScoreSchema.index({ type: 1, periodKey: 1, userId: 1 }, { unique: true });
// Board reads and rank counts: highest score first, earliest to reach it wins ties.
PeriodScoreSchema.index({ type: 1, periodKey: 1, score: -1, reachedAt: 1 });

const PeriodScore: Model<PeriodScoreModel> =
  models[DATABASE_MODELS.PERIOD_SCORE] ||
  model<PeriodScoreModel>(DATABASE_MODELS.PERIOD_SCORE, PeriodScoreSchema);

export default PeriodScore;
