import { type Model, model, models, Schema } from 'mongoose';

import {
  COMPANY_TYPES,
  DATABASE_MODELS,
  DSA_TOPICS,
  GOAL_TYPES,
  INTERVIEW_CATEGORIES,
  PLATFORM_USAGE,
  USER_ROLE,
  WORK_DOMAIN,  
} from '@/lib/constants';
import type { UserModel } from '@/lib/interfaces';

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

const DSAYatraSchema = new Schema({
  dyOnboarded: {
    type: Boolean,
    default: false,
  },
  experienceLevel: {
    type: String,
  },
  timeline: {
    type: String,
  },
  target: {
    type: String,
  },
  preferredLanguage: {
    type: String,
  },
  targetTopics: {
    type: [String],
    enum: DSA_TOPICS,
    default: [],
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
    from: {
      type: String,
      enum: [
        'webapp',           // From main webapp
        'prepyatra',        // From PrepYatra platform
        'dsayatra',         // From DSAYatra platform
        'quiz',             // From quiz app
        'direct'            // Direct onboarding (existing users)
      ],
      default: 'direct'
    },
    prepYatra: PrepYatraSchema,
    dsaYatra: DSAYatraSchema,
  },
  { timestamps: true }
);

const User: Model<UserModel> =
  models?.User || model<UserModel>(DATABASE_MODELS.USER, UserSchema);

export default User;
