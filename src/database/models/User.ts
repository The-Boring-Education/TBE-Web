import { type Model, model, models, Schema } from 'mongoose';

import {
  COMPANY_TYPES,
  DATABASE_MODELS,
  GOAL_TYPES,
  INTERVIEW_CATEGORIES,
  PLATFORM_USAGE,
  USER_ROLE,
  WORK_DOMAIN,
} from '@/constant';
import type { UserModel } from '@/interfaces';

const PrepYatraSchema = new Schema({
  pyOnboarded: {
    type: Boolean,
    default: false,
  },
 
  experienceLevel: {
    type: String,
  },
  workDomain: {
    type: String,
    enum: WORK_DOMAIN,
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
  prepLog: {
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastLoggedDate: {
      type: Date,
    },
    totalLogs: {
      type: Number,
      default: 0,
    },
  },
});

const UserSchema: Schema<UserModel> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
    },
    userName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
    },
    image: {
      type: String,
    },
    provider: {
      type: String,
    },
    providerAccountId: {
      type: String,
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    occupation: {
      type: String,
      enum: USER_ROLE,
    },
    purpose: {
      type: [String],
      enum: PLATFORM_USAGE,
    },
    contactNo: {
      type: String,
    },
    linkedInUrl: {
      type: String,
    },
    githubUrl: {
      type: String,
    },
    leetCodeUrl: {
      type: String,
    },
    userSkills: {
      type: [String],
      default: [],
    },
    userSkillsLastUpdated: {
      type: Date,
      default: null,
    },
    prepYatra: PrepYatraSchema,
  },
  { timestamps: true }
);

const User: Model<UserModel> =
  models?.User || model<UserModel>(DATABASE_MODELS.USER, UserSchema);

export default User;
