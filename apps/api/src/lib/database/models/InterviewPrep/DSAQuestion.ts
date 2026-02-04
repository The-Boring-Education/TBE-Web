import { type Model, model, models, Schema } from 'mongoose';

import {
  COMPANY_TYPES,
  DATABASE_MODELS,
  DSA_DIFFICULTY,
  DSA_DOMAIN,
  DSA_TOPICS,
} from '@/lib/constants';
import type { DSAQuestionModel } from '@/lib/interfaces';

const DSAQuestionSchema = new Schema<DSAQuestionModel>(
  {
    title: {
      type: String,
      required: [true, 'Question Title is required'],
    },
    description: {
      type: String,
      required: [true, 'Question Description is required'],
    },
    examples: {
      type: [{
        input: {
          type: String,
          required: true,
        },
        output: {
          type: String,
          required: true,
        },
        explanation: {
          type: String,
          required: true,
        },
      }],
      required: [true, 'At least one example is required'],
      validate: {
        validator: (v: any[]) => Array.isArray(v) && v.length > 0,
        message: 'At least one example is required',
      },
    },
    constraints: {
      type: [String],
      required: false,
    },
    hints: {
      type: [String],
      required: false,
    },
    domain: {
      type: [String],
      enum: DSA_DOMAIN,
      required: [true, 'Domain is required'],
    },
    difficulty: {
      type: String,
      enum: DSA_DIFFICULTY,
      required: [true, 'Difficulty is required'],
    },
    companyTypes: {
      type: [String],
      enum: COMPANY_TYPES,
      required: [true, 'Company Types are required'],
    },
    topics: {
      type: [String],
      enum: DSA_TOPICS,
      required: [true, 'DSA Topics are required'],
    },
    order: {
      type: Number,
      required: false,
      default: 0,
      index: true,
    },
    leetcodeLink: {
      type: String,
      required: false,
      validate: {
        validator: (v: string) => !v || /^https:\/\/leetcode\.com\/problems\/.+\/$/.test(v),
        message: 'Invalid LeetCode URL format. Must match: https://leetcode.com/problems/{problem-slug}/',
      },
    },
    youtubeSearchLink: {
      type: String,
      required: false,
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

// Create indexes for efficient querying
DSAQuestionSchema.index({ domain: 1 });
DSAQuestionSchema.index({ difficulty: 1 });
DSAQuestionSchema.index({ topics: 1 });
DSAQuestionSchema.index({ companyTypes: 1 });
DSAQuestionSchema.index({ order: 1 }); // For sorting by custom order

const DSAQuestion: Model<DSAQuestionModel> =
  models?.DSAQuestion ||
  model<DSAQuestionModel>(
    DATABASE_MODELS.DSA_QUESTION,
    DSAQuestionSchema
  );

export default DSAQuestion;
