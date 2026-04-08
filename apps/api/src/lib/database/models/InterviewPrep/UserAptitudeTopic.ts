import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS } from "@/lib/constants";
import type {
  UserAptitudeTopicModel,
  UserAptitudeTopicQuestionModel,
} from "@/lib/interfaces";

const UserAptitudeQuestionSchema = new Schema<UserAptitudeTopicQuestionModel>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      required: [true, "Question ID is required"],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    _id: true,
  },
);

const UserAptitudeTopicSchema = new Schema<UserAptitudeTopicModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, "User ID is required"],
      index: true,
    },
    topicSlug: {
      type: String,
      required: [true, "Topic slug is required"],
      trim: true,
      index: true,
    },
    questions: [UserAptitudeQuestionSchema],
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

UserAptitudeTopicSchema.index({ userId: 1, topicSlug: 1 }, { unique: true });

const UserAptitudeTopic: Model<UserAptitudeTopicModel> =
  models?.UserAptitudeTopic ||
  model<UserAptitudeTopicModel>(
    DATABASE_MODELS.USER_APTITUDE_TOPIC,
    UserAptitudeTopicSchema,
  );

export default UserAptitudeTopic;
