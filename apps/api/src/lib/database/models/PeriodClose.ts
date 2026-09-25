import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS, LEADERBOARD_TYPES } from "@/lib/constants";
import type { PeriodCloseModel } from "@/lib/interfaces";

const RankedUserSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: true,
    },
    rank: { type: Number, required: true },
    score: { type: Number },
    /** Set when a close run claims this recipient, before the email is sent. */
    claimedAt: { type: Date },
    sentAt: { type: Date },
  },
  { _id: false },
);

/** One record per closed Period: frozen Champions/standings and who was emailed (idempotency). */
const PeriodCloseSchema = new Schema<PeriodCloseModel>(
  {
    type: { type: String, enum: LEADERBOARD_TYPES, required: true },
    periodKey: { type: String, required: true },
    champions: { type: [RankedUserSchema], default: [] },
    /** Frozen top finishers (email recipients), ranked. */
    standings: { type: [RankedUserSchema], default: [] },
    notified: { type: [RankedUserSchema], default: [] },
    closedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

PeriodCloseSchema.index({ type: 1, periodKey: 1 }, { unique: true });
PeriodCloseSchema.index({ "champions.userId": 1, type: 1 });

const PeriodClose: Model<PeriodCloseModel> =
  models[DATABASE_MODELS.PERIOD_CLOSE] ||
  model<PeriodCloseModel>(DATABASE_MODELS.PERIOD_CLOSE, PeriodCloseSchema);

export default PeriodClose;
