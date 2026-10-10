import {
  applyContentIdOnCreate,
  CHAPTER_KEY_MAX_LENGTH,
  CHAPTER_KEY_PATTERN,
} from "@tbe/utils";
import { type Model, model, models, Schema } from "mongoose";

import {
  COURSE_STATUS,
  COURSE_STATUS_DEFAULT,
  DATABASE_MODELS,
  DIFFICULTY_LEVEL,
  ROADMAPS,
} from "@/lib/constants";
import type { CourseChapterModel, CourseModel } from "@/lib/interfaces";

const chapterSchema = new Schema<CourseChapterModel>(
  {
    key: {
      type: String,
      required: [true, "Chapter key is required"],
      trim: true,
      lowercase: true,
      match: [
        CHAPTER_KEY_PATTERN,
        "Chapter key must be kebab-case (lowercase letters, digits and single hyphens)",
      ],
      maxlength: [
        CHAPTER_KEY_MAX_LENGTH,
        `Chapter key must be at most ${CHAPTER_KEY_MAX_LENGTH} characters`,
      ],
    },
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
    status: {
      type: String,
      enum: COURSE_STATUS,
      default: COURSE_STATUS_DEFAULT,
      required: true,
      index: true,
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

applyContentIdOnCreate(CourseSchema);

CourseSchema.path("chapters").validate((chapters: CourseChapterModel[]) => {
  const keys = (chapters ?? []).map((chapter) =>
    String(chapter?.key ?? "")
      .trim()
      .toLowerCase(),
  );
  return new Set(keys).size === keys.length;
}, "Chapter keys must be unique within a course");

const Course: Model<CourseModel> =
  models?.Course || model<CourseModel>(DATABASE_MODELS.COURSE, CourseSchema);
export default Course;
