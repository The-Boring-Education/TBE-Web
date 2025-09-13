import { type Model, model, models, Schema } from 'mongoose';
import { DATABASE_MODELS } from '@/constant';

export interface UserQuestionPerformanceModel {
  _id?: string;
  userId: Schema.Types.ObjectId;
  questionId: Schema.Types.ObjectId;
  categoryName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  attempts: number;
  correctAttempts: number;
  averageTime: number; // seconds
  lastAttemptedAt: Date;
  strengthLevel: number; // 0-1, calculated based on performance
  nextReviewDate: Date; // for spaced repetition
  easeFactor: number; // spaced repetition parameter (SuperMemo-2)
  interval: number; // days until next review
  createdAt?: Date;
  updatedAt?: Date;
}

const UserQuestionPerformanceSchema = new Schema<UserQuestionPerformanceModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, 'User ID is required'],
    },
    questionId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Question ID is required'],
    },
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: [true, 'Difficulty is required'],
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    correctAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastAttemptedAt: {
      type: Date,
      default: Date.now,
    },
    strengthLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    nextReviewDate: {
      type: Date,
      default: Date.now,
    },
    easeFactor: {
      type: Number,
      default: 2.5, // SuperMemo-2 default
      min: 1.3,
    },
    interval: {
      type: Number,
      default: 1, // days
      min: 1,
    },
  },
  { timestamps: true }
);

// Unique index to prevent duplicate records
UserQuestionPerformanceSchema.index({ userId: 1, questionId: 1 }, { unique: true });

// Indexes for performance queries
UserQuestionPerformanceSchema.index({ userId: 1, nextReviewDate: 1 });
UserQuestionPerformanceSchema.index({ userId: 1, categoryName: 1 });
UserQuestionPerformanceSchema.index({ userId: 1, strengthLevel: 1 });

const UserQuestionPerformance: Model<UserQuestionPerformanceModel> =
  models?.UserQuestionPerformance || 
  model<UserQuestionPerformanceModel>(DATABASE_MODELS.USER_QUESTION_PERFORMANCE, UserQuestionPerformanceSchema);

export default UserQuestionPerformance;