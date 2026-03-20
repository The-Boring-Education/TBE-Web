import type { Model } from "mongoose";
import { model, models, Schema } from "mongoose";

import { DATABASE_MODELS } from "@/lib/constants";
import type { StudyGuideModel } from "@/lib/interfaces";

const StudyGuideSchema = new Schema<StudyGuideModel>(
  {
    topicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    hasGuide: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    sections: [
      {
        _id: false,
        id: { type: String, default: null },
        label: { type: String, default: null },
        type: {
          type: String,
          enum: ["intro", "concept", "pattern", "cheatsheet", null],
          default: null,
        },
        isDivider: { type: Boolean, default: false },
        dividerLabel: { type: String, default: null },
        sortOrder: { type: Number, default: 0 },
        content: { type: Schema.Types.Mixed, default: null },
      },
    ],
  },
  {
    timestamps: true,
    collection: "studyguides",
  },
);

const StudyGuide =
  (models[DATABASE_MODELS.STUDY_GUIDE] as Model<StudyGuideModel>) ||
  model<StudyGuideModel>(DATABASE_MODELS.STUDY_GUIDE, StudyGuideSchema);

export default StudyGuide;
