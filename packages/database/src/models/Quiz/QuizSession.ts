import { type Model, model, models, Schema } from 'mongoose';
import { DATABASE_MODELS } from '@tbe/constants';

export interface QuizSessionQuestion {
  questionId: Schema.Types.ObjectId;        
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  detailedExplanation: string;
  userAnswer?: number;
  isCorrect?: boolean;
  timeSpent?: number; // seconds
  answeredAt?: Date;
}

export interface QuizSessionModel {
  _id?: string;
  userId: Schema.Types.ObjectId;
  quizId: Schema.Types.ObjectId;
  categoryName: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount: number;
  questions: QuizSessionQuestion[];
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
  totalTime?: number; // seconds
  score?: number;
  percentage?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const QuizSessionQuestionSchema = new Schema<QuizSessionQuestion>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
    },
    correctAnswer: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    detailedExplanation: {
      type: String,
      required: true,
    },
    userAnswer: {
      type: Number,
      default: null,
    },
    isCorrect: {
      type: Boolean,
      default: null,
    },
    timeSpent: {
      type: Number,
      default: null,
    },
    answeredAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const QuizSessionSchema = new Schema<QuizSessionModel>(
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
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      required: [true, 'Difficulty is required'],
    },
    questionCount: {
      type: Number,
      required: [true, 'Question count is required'],
      min: 1,
      max: 50,
    },
    questions: [QuizSessionQuestionSchema],
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    totalTime: {
      type: Number,
      default: null,
    },
    score: {
      type: Number,
      default: null,
    },
    percentage: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for performance
QuizSessionSchema.index({ userId: 1, startedAt: -1 });
QuizSessionSchema.index({ userId: 1, status: 1 });
QuizSessionSchema.index({ quizId: 1, status: 1 });

const QuizSession: Model<QuizSessionModel> =
  models?.QuizSession || model<QuizSessionModel>(DATABASE_MODELS.QUIZ_SESSION, QuizSessionSchema);

export default QuizSession;