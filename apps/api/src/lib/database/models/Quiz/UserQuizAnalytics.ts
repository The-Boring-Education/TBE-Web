import { type Model, model, models, Schema } from 'mongoose';
import { DATABASE_MODELS } from '@/lib/constants';

export interface ProgressTimelineEntry {
  date: Date;
  score: number;
  difficulty: string;
  timeSpent: number;
}

export interface DifficultyPerformance {
  easy: { attempts: number; successRate: number };
  medium: { attempts: number; successRate: number };
  hard: { attempts: number; successRate: number };
}

export interface UserQuizAnalyticsModel {
  _id?: string;
  userId: Schema.Types.ObjectId;
  categoryName: string;
  totalAttempts: number;
  bestScore: number;
  averageScore: number;
  totalTimeSpent: number; // seconds
  strengthAreas: string[];
  improvementAreas: string[];
  difficultyPerformance: DifficultyPerformance;
  progressTimeline: ProgressTimelineEntry[];
  lastAttemptAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProgressTimelineSchema = new Schema<ProgressTimelineEntry>(
  {
    date: {
      type: Date,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    difficulty: {
      type: String,
      required: true,
    },
    timeSpent: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const DifficultyPerformanceSubSchema = new Schema(
  {
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
  },
  { _id: false }
);

const DifficultyPerformanceSchema = new Schema<DifficultyPerformance>(
  {
    easy: DifficultyPerformanceSubSchema,
    medium: DifficultyPerformanceSubSchema,
    hard: DifficultyPerformanceSubSchema,
  },
  { _id: false }
);

const UserQuizAnalyticsSchema = new Schema<UserQuizAnalyticsModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, 'User ID is required'],
    },
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
    },
    totalAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    bestScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    strengthAreas: {
      type: [String],
      default: [],
    },
    improvementAreas: {
      type: [String],
      default: [],
    },
    difficultyPerformance: {
      type: DifficultyPerformanceSchema,
      default: {
        easy: { attempts: 0, successRate: 0 },
        medium: { attempts: 0, successRate: 0 },
        hard: { attempts: 0, successRate: 0 },
      },
    },
    progressTimeline: [ProgressTimelineSchema],
    lastAttemptAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Unique index per user-category combination
UserQuizAnalyticsSchema.index({ userId: 1, categoryName: 1 }, { unique: true });

// Index for leaderboard queries
UserQuizAnalyticsSchema.index({ categoryName: 1, bestScore: -1 });
UserQuizAnalyticsSchema.index({ categoryName: 1, averageScore: -1 });

const UserQuizAnalytics: Model<UserQuizAnalyticsModel> =
  models?.UserQuizAnalytics || 
  model<UserQuizAnalyticsModel>(DATABASE_MODELS.USER_QUIZ_ANALYTICS, UserQuizAnalyticsSchema);

export default UserQuizAnalytics;