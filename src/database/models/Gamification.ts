import { type Model,model, models, Schema } from 'mongoose';

import { DATABASE_MODELS, USER_POINTS_ACTION } from '@/constant';
import type { GamificationModel, UserPointsAction } from '@/interfaces';

const ActionSchema = new Schema<UserPointsAction>(
  {
    actionType: {
      type: String,
      enum: USER_POINTS_ACTION,
      required: true,
    },
    pointsEarned: { type: Number, required: true },
  },
  { timestamps: true }
);

const GamificationSchema = new Schema<GamificationModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: true,
    },
    points: { type: Number, default: 0 },
    actions: [ActionSchema],
  },
  { timestamps: true }
);

const Gamification: Model<GamificationModel> =
  models[DATABASE_MODELS.GAMIFICATION] ||
  model<GamificationModel>(DATABASE_MODELS.GAMIFICATION, GamificationSchema);

export default Gamification;
