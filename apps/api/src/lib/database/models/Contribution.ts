import { type Model, model, models, Schema } from "mongoose";

import {
  CATEGORY_TO_TYPE_GROUP,
  CONTRIBUTION_CATEGORIES,
  CONTRIBUTION_STATUS,
  CONTRIBUTION_TYPE_GROUPS,
  DATABASE_MODELS,
} from "@/lib/constants";
import type { ContributionDocumentModel } from "@/lib/interfaces";

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
    },
    typeGroup: {
      type: String,
      enum: CONTRIBUTION_TYPE_GROUPS,
      required: true,
      index: true,
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
    },
    awardedXp: {
      type: Number,
      default: 0,
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
