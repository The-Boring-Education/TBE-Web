import { type Model, model, models, Schema } from 'mongoose';

import { DATABASE_MODELS } from '@tbe/constants';
import type { PrepLogModel } from '@tbe/interface';

const PrepLogSchema = new Schema<PrepLogModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    timeSpent: {
      type: Number,
      required: true,
    },
    mentorFeedback: {
      type: String,
    },
  },
  { timestamps: true }
);

const PrepLog: Model<PrepLogModel> =
  models?.PrepLog ||
  model<PrepLogModel>(DATABASE_MODELS.PREP_LOG, PrepLogSchema);

export default PrepLog;
