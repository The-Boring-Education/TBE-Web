import { type Model, model, models, type Query, Schema } from "mongoose";

import {
  CATEGORY_TO_TYPE_GROUP,
  CONTRIBUTION_CATEGORIES,
  CONTRIBUTION_STATUS,
  CONTRIBUTION_TYPE_GROUPS,
  DATABASE_MODELS,
} from "@/lib/constants";
import type { ContributionDocumentModel } from "@/lib/interfaces";

const categoryTypeGroupValidator = {
  validator(
    this: ContributionDocumentModel | Query<unknown, ContributionDocumentModel>,
  ) {
    const category: unknown = this.get("category");
    const validCategory = CONTRIBUTION_CATEGORIES.find(
      (candidate) => candidate === category,
    );
    return (
      validCategory !== undefined &&
      this.get("typeGroup") === CATEGORY_TO_TYPE_GROUP[validCategory]
    );
  },
  message: "typeGroup does not match category mapping",
};

const ContributionSchema = new Schema<ContributionDocumentModel>(
  {
    contributorId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.CONTRIBUTOR,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: true,
      index: true,
    },
    contributorName: {
      type: String,
      required: true,
      trim: true,
    },
    contributorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    category: {
      type: String,
      enum: CONTRIBUTION_CATEGORIES,
      required: true,
      index: true,
      validate: categoryTypeGroupValidator,
    },
    typeGroup: {
      type: String,
      enum: CONTRIBUTION_TYPE_GROUPS,
      required: true,
      index: true,
      default(this: ContributionDocumentModel) {
        return CATEGORY_TO_TYPE_GROUP[this?.category];
      },
      validate: categoryTypeGroupValidator,
    },
    proofUrl: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    standardXp: {
      type: Number,
      required: true,
      min: 0,
    },
    awardedXp: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: CONTRIBUTION_STATUS,
      default: "pending",
      index: true,
    },
    adminFeedback: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: String,
      trim: true,
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

ContributionSchema.pre("validate", function (next) {
  if (this.category && CATEGORY_TO_TYPE_GROUP[this.category]) {
    this.typeGroup = CATEGORY_TO_TYPE_GROUP[this.category];
  }
  next();
});

// Compound indexes for user dashboard filtering and admin moderation queue
ContributionSchema.index({ contributorId: 1, status: 1, createdAt: -1 });
ContributionSchema.index({ userId: 1, typeGroup: 1, createdAt: -1 });
ContributionSchema.index({ status: 1, createdAt: -1 });

const Contribution: Model<ContributionDocumentModel> =
  models?.[DATABASE_MODELS.CONTRIBUTION] ||
  model<ContributionDocumentModel>(
    DATABASE_MODELS.CONTRIBUTION,
    ContributionSchema,
  );

export default Contribution;
