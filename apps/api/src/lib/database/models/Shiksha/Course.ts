import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS, DIFFICULTY_LEVEL, ROADMAPS } from "@/lib/constants";
import type { CourseChapterModel, CourseModel } from "@/lib/interfaces";

const chapterSchema = new Schema<CourseChapterModel>(
  {
    name: {
      type: String,
      required: [true, "Chapter Name is required"],
    },
    content: {
      type: String,
      required: [true, "Chapter content is required"],
    },
    isOptional: {
      type: Boolean,
    },
  },
  { timestamps: true, _id: true },
);

const CourseSchema = new Schema<CourseModel>(
  {
    contentId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Course name is required"],
    },
    meta: { type: String },
    slug: {
      type: String,
      required: [true, "Slug is required"],
    },
    coverImageURL: {
      type: String,
      required: [true, "Course thumbnail is required"],
    },
    description: {
      type: String,
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
    chapters: [chapterSchema],
    roadmap: { type: String, enum: ROADMAPS, required: true },
    difficultyLevel: {
      type: String,
      enum: DIFFICULTY_LEVEL,
      required: true,
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

const Course: Model<CourseModel> =
  models?.Course || model<CourseModel>(DATABASE_MODELS.COURSE, CourseSchema);
export default Course;
