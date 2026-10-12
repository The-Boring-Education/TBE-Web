import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS } from "@/lib/constants";

export type ContributionStatus = "pending" | "approved" | "rejected";

export interface ContributionModel {
  contributorId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  contributorName: string;
  contributorEmail: string;
  category: string;
  proofUrl: string;
  title: string;
  description?: string;
  standardXp: number;
  awardedXp: number;
  status: ContributionStatus;
  adminFeedback?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContributionSchema = new Schema<ContributionModel>(
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
    },
    contributorEmail: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
    },
    proofUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
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
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminFeedback: {
      type: String,
    },
    reviewedBy: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Contribution: Model<ContributionModel> =
  models[DATABASE_MODELS.CONTRIBUTION] ||
  model<ContributionModel>(DATABASE_MODELS.CONTRIBUTION, ContributionSchema);

export default Contribution;
