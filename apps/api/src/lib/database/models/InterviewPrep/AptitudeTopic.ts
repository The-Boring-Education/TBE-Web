import { DSA_DIFFICULTY } from "@tbe/constants";
import { applyContentIdOnCreate } from "@tbe/utils";
import { type Model, model, models, Schema } from "mongoose";

import { APTITUDE_TOPIC_SLUGS, DATABASE_MODELS } from "@/lib/constants";
import type {
  AptitudeQuestionModel,
  AptitudeQuestionOptionModel,
  AptitudeTopicModel,
} from "@/lib/interfaces";

const AptitudeOptionSchema = new Schema<AptitudeQuestionOptionModel>(
  {
    text: {
      type: String,
      required: [true, "Option text is required"],
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const AptitudeQuestionSchema = new Schema<AptitudeQuestionModel>(
  {
    question: {
      type: String,
      required: [true, "Question text is required"],
    },
    options: {
      type: [AptitudeOptionSchema],
      default: [],
    },
    answer: {
      type: String,
      default: "",
    },
    difficulty: {
      type: String,
      enum: DSA_DIFFICULTY,
      default: "MEDIUM",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, _id: true },
);

const AptitudeTopicSchema = new Schema<AptitudeTopicModel>(
  {
    contentId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    topic: {
      type: String,
      required: [true, "Topic slug is required"],
      enum: APTITUDE_TOPIC_SLUGS,
      unique: true,
      index: true,
    },
    studyGuide: {
      type: String,
      default: "",
    },
    questions: {
      type: [AptitudeQuestionSchema],
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

applyContentIdOnCreate(AptitudeTopicSchema);

const AptitudeTopic: Model<AptitudeTopicModel> =
  models?.AptitudeTopic ||
  model<AptitudeTopicModel>(
    DATABASE_MODELS.APTITUDE_TOPIC || "AptitudeTopic",
    AptitudeTopicSchema,
  );

export default AptitudeTopic;
