import { type Model, model, models, Schema } from "mongoose";

import {
  COMPANY_TYPES,
  DATABASE_MODELS,
  INTERVIEW_QUESTION_FREQUENCY,
  PRIORITY_LEVELS,
  ROADMAPS,
} from "@/lib/constants";
import type {
  InterviewSheetModel,
  InterviewSheetQuestionModel,
} from "@/lib/interfaces";

const questionSchema = new Schema<InterviewSheetQuestionModel>(
  {
    title: {
      type: String,
      required: [true, "Question Title is required"],
    },
    question: {
      type: String,
      required: [true, "Question Name is required"],
    },
    answer: {
      type: String,
      required: [true, "Question answer is required"],
    },
    frequency: {
      type: String,
      enum: INTERVIEW_QUESTION_FREQUENCY,
      required: true,
    },
    companyTypes: {
      type: [String],
      enum: COMPANY_TYPES,
      default: [],
    },
    priority: {
      type: String,
      enum: PRIORITY_LEVELS,
      default: "Medium",
      required: true,
    },
    resources: {
      youtubeURL: {
        type: String,
        default: null,
      },
      leetcodeURL: {
        type: String,
        default: null,
      },
      blogURL: {
        type: String,
        default: null,
      },
    },
  },
  { timestamps: true, _id: true },
);

const InterviewSheetSchema = new Schema<InterviewSheetModel>(
  {
    name: {
      type: String,
      required: [true, "InterviewSheet name is required"],
    },
    meta: { type: String },
    slug: {
      type: String,
      required: [true, "Slug is required"],
    },
    coverImageURL: {
      type: String,
      required: [true, "Sheet thumbnail is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    liveOn: {
      type: Date,
      required: [true, "Live on is required"],
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
    },
    discountPercentage: {
      type: Number,
      min: [0, "Discount percentage cannot be negative"],
      max: [100, "Discount percentage cannot exceed 100%"],
      default: 0,
    },
    appliedCoupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    questions: [questionSchema],
    dsaQuestions: [
      {
        type: Schema.Types.ObjectId,
        ref: DATABASE_MODELS.DSA_QUESTION,
      },
    ],
    roadmap: {
      type: String,
      enum: ROADMAPS,
      required: [true, "Roadmap on is required"],
    },
    features: [
      {
        type: String,
      },
    ],
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
  },
);

const InterviewSheet: Model<InterviewSheetModel> =
  models?.InterviewSheet ||
  model<InterviewSheetModel>(
    DATABASE_MODELS.INTERVIEW_SHEET,
    InterviewSheetSchema,
  );
export default InterviewSheet;
