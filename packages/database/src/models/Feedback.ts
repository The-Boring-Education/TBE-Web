import { type Model, model, models, Schema } from 'mongoose';

import { DATABASE_MODELS, FEEDBACK_TYPES } from '@tbe/constants';
import type { FeedbackModel } from '@tbe/interface';

const FeedbackSchema: Schema<FeedbackModel> = new Schema(
  {
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
    },

    feedback: {
      type: String,
    },

    type: {
      type: String,
      required: [true, 'Feedback type is required'],
      enum: FEEDBACK_TYPES,
      default: 'GENERAL',
    },

    ref: {
      type: Schema.Types.ObjectId,
      refPath: 'type',
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, 'User reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

const Feedback: Model<FeedbackModel> =
  models?.Feedback ||
  model<FeedbackModel>(DATABASE_MODELS.FEEDBACK, FeedbackSchema);

export default Feedback;
