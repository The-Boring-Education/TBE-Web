import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS } from "@/lib/constants";
import type { UserCourseModel } from "@/lib/interfaces";

const UserChapterSchema = new Schema(
  {
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.COURSE_CHAPTER,
      required: [true, "Chapter id is required"],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    _id: false,
  },
);

const UserCourseSchema = new Schema<UserCourseModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, "User id is required"],
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.COURSE,
      required: [true, "Course id is required"],
      index: true,
    },
    chapters: [UserChapterSchema],
    isCompleted: {
      type: Boolean,
      default: false,
    },
    certificateId: {
      type: String,
      default: null,
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

UserCourseSchema.virtual("course", {
  ref: DATABASE_MODELS.COURSE,
  localField: "courseId",
  foreignField: "_id",
  justOne: true,
});

const UserCourse: Model<UserCourseModel> =
  models?.UserCourse ||
  model<UserCourseModel>(DATABASE_MODELS.USER_COURSE, UserCourseSchema);

export default UserCourse;
