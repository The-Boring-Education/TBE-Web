import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS, TBE_APP, USER_POINTS_ACTION } from "@/lib/constants";
import type { PointEventModel } from "@/lib/interfaces";

/** Append-only record of every points gain or loss (see CONTEXT.md: Point Event). */
const PointEventSchema = new Schema<PointEventModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: true,
    },
    actionType: { type: String, enum: USER_POINTS_ACTION, required: true },
    points: { type: Number, required: true },
    itemId: { type: String },
    app: { type: String, enum: TBE_APP },
    countedForLeaderboard: { type: Boolean, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

PointEventSchema.index({ userId: 1, createdAt: -1 });

const PointEvent: Model<PointEventModel> =
  models[DATABASE_MODELS.POINT_EVENT] ||
  model<PointEventModel>(DATABASE_MODELS.POINT_EVENT, PointEventSchema);

export default PointEvent;
