import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS } from "@/lib/constants";
import type { UserQuestionCodeModel } from "@/lib/interfaces";

const UserQuestionCodeSchema = new Schema<UserQuestionCodeModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, "User ID is required"],
      index: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.DSA_QUESTION,
      required: [true, "Question ID is required"],
      index: true,
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      enum: ["javascript", "python", "java", "cpp"],
    },
    code: {
      type: String,
      required: [true, "Code is required"],
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

UserQuestionCodeSchema.index(
  { userId: 1, questionId: 1, language: 1 },
  { unique: true },
);

const UserQuestionCode: Model<UserQuestionCodeModel> =
  models?.UserQuestionCode ||
  model<UserQuestionCodeModel>(
    DATABASE_MODELS.USER_QUESTION_CODE,
    UserQuestionCodeSchema,
  );

export default UserQuestionCode;

