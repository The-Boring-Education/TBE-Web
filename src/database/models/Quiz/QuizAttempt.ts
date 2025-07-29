import { type Model, model, models, Schema } from 'mongoose';

import { DATABASE_MODELS } from '@/constant';

export interface QuizAttemptAnswer {
  questionIndex: number;
  selectedAnswer: number | null;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

export interface QuizAttemptModel {
  _id?: string;
  userId: Schema.Types.ObjectId;
  quizId: Schema.Types.ObjectId;
  categoryId: string;
  categoryName: string;
  answers: QuizAttemptAnswer[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number; // in seconds
  pointsEarned: number;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const QuizAttemptAnswerSchema = new Schema<QuizAttemptAnswer>(
  {
    questionIndex: {
      type: Number,
      required: true,
    },
    selectedAnswer: {
      type: Number,
      default: null,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    timeSpent: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const QuizAttemptSchema = new Schema<QuizAttemptModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, 'User ID is required'],
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.QUIZ,
      required: [true, 'Quiz ID is required'],
    },
    categoryId: {
      type: String,
      required: [true, 'Category ID is required'],
    },
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
    },
    answers: [QuizAttemptAnswerSchema],
    score: {
      type: Number,
      required: [true, 'Score is required'],
    },
    totalQuestions: {
      type: Number,
      required: [true, 'Total questions is required'],
    },
    correctAnswers: {
      type: Number,
      required: [true, 'Correct answers count is required'],
    },
    timeTaken: {
      type: Number,
      required: [true, 'Time taken is required'],
    },
    pointsEarned: {
      type: Number,
      required: [true, 'Points earned is required'],
      default: 0,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
QuizAttemptSchema.index({ userId: 1, completedAt: -1 });
QuizAttemptSchema.index({ userId: 1, categoryId: 1 });

const QuizAttempt: Model<QuizAttemptModel> =
  models?.QuizAttempt ||
  model<QuizAttemptModel>(DATABASE_MODELS.QUIZ_ATTEMPT, QuizAttemptSchema);

export default QuizAttempt;
