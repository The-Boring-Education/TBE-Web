import { type Model, model, models, Schema } from 'mongoose';

import {
  APTITUDE_TOPIC_SLUGS,
  DATABASE_MODELS,
  DSA_DIFFICULTY,
} from '@/lib/constants';
import type {
  AptitudeQuestionModel,
  AptitudeQuestionOptionModel,
} from '@/lib/interfaces';

const AptitudeOptionSchema = new Schema<AptitudeQuestionOptionModel>(
  {
    text: {
      type: String,
      required: [true, 'Option text is required'],
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const AptitudeQuestionSchema = new Schema<AptitudeQuestionModel>(
  {
    topic: {
      type: String,
      required: [true, 'Topic slug is required'],
      enum: APTITUDE_TOPIC_SLUGS,
      index: true,
    },
    question: {
      type: String,
      required: [true, 'Question text is required'],
    },
    options: {
      type: [AptitudeOptionSchema],
      default: [],
    },
    answer: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: DSA_DIFFICULTY,
      default: 'MEDIUM',
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    _id: true,
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
  }
);

AptitudeQuestionSchema.index({ topic: 1, order: 1 });
AptitudeQuestionSchema.index({ difficulty: 1 });

const AptitudeQuestion: Model<AptitudeQuestionModel> =
  models?.AptitudeQuestion ||
  model<AptitudeQuestionModel>(
    DATABASE_MODELS.APTITUDE_QUESTION,
    AptitudeQuestionSchema
  );

export default AptitudeQuestion;
