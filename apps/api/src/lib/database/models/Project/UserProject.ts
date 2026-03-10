import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS } from "@/lib/constants";
import type {
  UserProjectChapterModel,
  UserProjectModel,
  UserProjectSectionModel,
} from "@/lib/interfaces";

const UserProjectChapterSchema = new Schema<UserProjectChapterModel>(
  {
    chapterId: {
      type: String,
      required: [true, "Chapter ID is required"],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    _id: false,
  },
);

const UserProjectSectionSchema = new Schema<UserProjectSectionModel>(
  {
    sectionId: {
      type: String,
      required: [true, "Section ID is required"],
    },
    chapters: [UserProjectChapterSchema],
  },
  {
    timestamps: true,
    _id: false,
  },
);

const UserProjectSchema = new Schema<UserProjectModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, "User ID is required"],
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.PROJECT,
      required: [true, "Project ID is required"],
      index: true,
    },
    sections: [UserProjectSectionSchema],
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

UserProjectSchema.virtual("project", {
  ref: DATABASE_MODELS.PROJECT,
  localField: "projectId",
  foreignField: "_id",
  justOne: true,
});

const UserProject: Model<UserProjectModel> =
  models?.UserProject ||
  model<UserProjectModel>(DATABASE_MODELS.USER_PROJECT, UserProjectSchema);

export default UserProject;
