import {  Schema, model, models } from 'mongoose';
import { FeedbackModel } from '@/interfaces';
import { DATABASE_MODELS } from '@/constant';

const FeedbackSchema: Schema<FeedbackModel> = new Schema(
  {
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5']
    },

    feedback: String,
    type: {
      type: String,
      required: [true, 'Feedback type is required'],
      enum: [
        'GENERAL',
        'SHIKSHA_CHAPTER', 
        'SHIKSHA_COURSE',
        'INTERVIEW_SHEET',
        'CERTIFICATE'
      ],
      default: 'GENERAL'
    },

    ref: {
      type: Schema.Types.ObjectId,
      refPath: 'type'
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
  },
  
  {
    timestamps: true,
  }
);

const Feedback = models?.Feedback || model<FeedbackModel>(DATABASE_MODELS.FEEDBACK, FeedbackSchema);

export default Feedback;