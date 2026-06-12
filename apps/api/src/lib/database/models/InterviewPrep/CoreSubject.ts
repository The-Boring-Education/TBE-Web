import { applyContentIdOnCreate } from "@tbe/utils";
import mongoose, { type Model, Schema } from "mongoose";

import { DATABASE_MODELS } from "@/lib/constants";

// ─── Nested schema types ──────────────────────────────────────────────────────

interface InterviewQuestion {
  q: string;
  a: string;
}

interface ChapterContent {
  overview: string;
  notes: string[];
  importantPoints: string[];
  interviewQuestions: InterviewQuestion[];
  codeBlock?: string;
  markdownContent?: string;
}

interface CoreSubjectChapter {
  title: string;
  description: string;
  content: ChapterContent;
  contentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CoreSubjectModel {
  contentId?: string;
  subjectId: string;
  label: string;
  chapters: CoreSubjectChapter[];
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const CoreSubjectInterviewQuestionSchema = new Schema<InterviewQuestion>(
  {
    q: { type: String, required: true },
    a: { type: String, required: true },
  },
  { _id: false },
);

const CoreSubjectChapterContentSchema = new Schema<ChapterContent>(
  {
    overview: { type: String, required: true },
    notes: { type: [String], default: [] },
    importantPoints: { type: [String], default: [] },
    interviewQuestions: {
      type: [CoreSubjectInterviewQuestionSchema],
      default: [],
    },
    codeBlock: { type: String, default: "" },
    markdownContent: { type: String, default: "" },
  },
  { _id: false },
);

const CoreSubjectChapterSchema = new Schema<CoreSubjectChapter>(
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
      transform: (_doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
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
