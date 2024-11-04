import {
  databaseModels,
  INTERVIEW_QUESTION_FREQUENCY,
  ROADMAPS,
} from '@/constant';
import { InterviewSheetQuestionModel, InterviewSheetModel } from '@/interfaces';
import { Model, Schema, model, models } from 'mongoose';

const questionSchema = new Schema<InterviewSheetQuestionModel>(
  {
    title: {
      type: String,
      required: [true, 'Question Title is required'],
    },
    question: {
      type: String,
      required: [true, 'Question Name is required'],
    },
    answer: {
      type: String,
      required: [true, 'Question answer is required'],
    },
    frequency: {
      type: String,
      enum: INTERVIEW_QUESTION_FREQUENCY,
      required: true,
    },
  },
  { timestamps: true, _id: true }
);

const InterviewSheetSchema = new Schema<InterviewSheetModel>(
  {
    name: {
      type: String,
      required: [true, 'InterviewSheet name is required'],
    },
    meta: { type: String },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
    },
    coverImageURL: {
      type: String,
      required: [true, 'Sheet thumbnail is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    liveOn: {
      type: Date,
      required: [true, 'Live on is required'],
    },
    questions: [questionSchema],
    roadmap: {
      type: String,
      enum: ROADMAPS,
      required: [true, 'Roadmap on is required'],
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

const InterviewSheet: Model<InterviewSheetModel> =
  models?.InterviewSheet ||
  model<InterviewSheetModel>(
    databaseModels.INTERVIEW_SHEET,
    InterviewSheetSchema
  );
export default InterviewSheet;
