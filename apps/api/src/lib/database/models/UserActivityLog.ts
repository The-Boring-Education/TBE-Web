import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS, TBE_APP, USER_POINTS_ACTION } from "@/lib/constants";
import type { UserActivityLogModel } from "@/lib/interfaces";

const UserActivityLogSchema = new Schema<UserActivityLogModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: true,
    },
    app: {
      type: String,
      enum: TBE_APP,
      required: true,
    },
    actionType: {
      type: String,
      enum: USER_POINTS_ACTION,
      required: true,
    },
    /** YYYY-MM-DD calendar day – used for fast streak grouping */
    date: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

// Efficient lookup of all activity dates for a user (streak calculation)
UserActivityLogSchema.index({ userId: 1, date: 1 });
// App-specific streak and leaderboard queries
UserActivityLogSchema.index({ userId: 1, app: 1, date: 1 });

const UserActivityLog: Model<UserActivityLogModel> =
  models[DATABASE_MODELS.USER_ACTIVITY_LOG] ||
  model<UserActivityLogModel>(
    DATABASE_MODELS.USER_ACTIVITY_LOG,
    UserActivityLogSchema,
  );

export default UserActivityLog;
