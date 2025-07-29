import { type Model, model, models, Schema } from 'mongoose';

import { DATABASE_MODELS } from '@/constant';

export interface QuizQuestionModel {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  detailedExplanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizModel {
  _id?: string;
  categoryId: string;
  categoryName: string;
  categoryDescription: string;
  categoryIcon: string;
  questions: QuizQuestionModel[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const QuizQuestionSchema = new Schema<QuizQuestionModel>(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: [
        {
          validator(v: string[]) {
            return v.length >= 2;
          },
          message: 'At least 2 options are required',
        },
      ],
    },
    correctAnswer: {
      type: Number,
      required: [true, 'Correct answer index is required'],
    },
    explanation: {
      type: String,
      required: [true, 'Explanation is required'],
    },
    detailedExplanation: {
      type: String,
      required: [true, 'Detailed explanation is required'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: [true, 'Difficulty level is required'],
    },
  },
  { _id: false }
);

const QuizSchema = new Schema<QuizModel>(
  {
    categoryId: {
      type: String,
      required: [true, 'Category ID is required'],
      unique: true,
    },
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
    },
    categoryDescription: {
      type: String,
      required: [true, 'Category description is required'],
    },
    categoryIcon: {
      type: String,
      required: [true, 'Category icon is required'],
    },
    questions: [QuizQuestionSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Quiz: Model<QuizModel> =
  models?.Quiz || model<QuizModel>(DATABASE_MODELS.QUIZ, QuizSchema);

export default Quiz;
