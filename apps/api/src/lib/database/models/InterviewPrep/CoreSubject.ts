import { applyContentIdOnCreate } from "@tbe/utils";
import mongoose, { type Model, Schema } from "mongoose";

import { DATABASE_MODELS } from "@/lib/constants";
import type {
  CoreSubjectChapterModel,
  CoreSubjectModel,
} from "@/lib/interfaces";

const CoreSubjectInterviewQuestionSchema = new Schema(
  {
    q: { type: String, required: true },
    a: { type: String, required: true },
  },
  { _id: false },
);

const CoreSubjectChapterContentSchema = new Schema(
  {
    overview: { type: String, required: true },
    notes: { type: [String], default: [] },
    importantPoints: { type: [String], default: [] },
    interviewQuestions: {
      type: [CoreSubjectInterviewQuestionSchema],
      default: [],
    },
    codeBlock: { type: String, default: "" },
  },
  { _id: false },
);

const CoreSubjectChapterSchema = new Schema<CoreSubjectChapterModel>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: CoreSubjectChapterContentSchema, required: true },
  },
  { _id: true, timestamps: true },
);

const CoreSubjectSchema = new Schema<CoreSubjectModel>(
  {
    contentId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    subjectId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    label: {
      type: String,
      required: true,
    },
    chapters: {
      type: [CoreSubjectChapterSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
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
  },
);

applyContentIdOnCreate(CoreSubjectSchema);

const CoreSubject: Model<CoreSubjectModel> =
  mongoose.models?.CoreSubject ||
  mongoose.model<CoreSubjectModel>(
    DATABASE_MODELS.CORE_SUBJECT || "CoreSubject",
    CoreSubjectSchema,
  );

export default CoreSubject;
