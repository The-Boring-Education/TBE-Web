import { type Model, model, models, Schema } from 'mongoose';

import {
  COMPANY_TYPES,
  DATABASE_MODELS,
  GOAL_TYPES,
  INTERVIEW_CATEGORIES,
  SUBSCRIPTION_STATUS,
} from '@/constant';
import type { PrepYatraUserModel } from '@/interfaces';

const PrepYatraUserSchema = new Schema<PrepYatraUserModel>(
  {
    supabaseUserId: {
      type: String,
      required: [true, 'Supabase User ID is required'],
      unique: true,
      index: true,
    },
    mongoUserId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, 'Mongo User ID is required'],
      index: true,
    },
    goal: {
      type: String,
      enum: GOAL_TYPES,
      required: [true, 'Goal is required'],
    },
    targetCompanies: {
      type: [String],
      enum: COMPANY_TYPES,
      default: [],
    },
    subscriptionStatus: {
      type: String,
      enum: SUBSCRIPTION_STATUS,
      default: 'Trial',
    },
    subscriptionExpiry: {
      type: Date,
    },
    preferences: {
      interviewCategories: {
        type: [String],
        enum: INTERVIEW_CATEGORIES,
        default: [],
      },
      focusAreas: {
        type: [String],
        default: [],
      },
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

const PrepYatraUser: Model<PrepYatraUserModel> =
  models?.PrepYatraUser ||
  model<PrepYatraUserModel>(
    DATABASE_MODELS.PREP_YATRA_USER,
    PrepYatraUserSchema
  );

export default PrepYatraUser;
