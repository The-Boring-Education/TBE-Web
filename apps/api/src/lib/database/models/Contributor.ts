import { type Model, model, models, Schema } from "mongoose";

import { CONTRIBUTOR_ROLES, DATABASE_MODELS } from "@/lib/constants";
import type { ContributorDocumentModel } from "@/lib/interfaces";

const ContributorSchema = new Schema<ContributorDocumentModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    githubUsername: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: CONTRIBUTOR_ROLES,
      default: "Contributor",
    },
    totalXp: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    approvedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isCaptain: {
      type: Boolean,
      default: false,
    },
    captainUnlockedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Invariant: Captain role, flag, and unlock timestamp are kept synchronized
ContributorSchema.pre("validate", function (next) {
  if (this.isCaptain) {
    if (this.role !== "TBE Captain") {
      this.role = "TBE Captain";
    }
    if (!this.captainUnlockedAt) {
      this.captainUnlockedAt = new Date();
    }
  } else if (this.role === "TBE Captain") {
    this.isCaptain = true;
    if (!this.captainUnlockedAt) {
      this.captainUnlockedAt = new Date();
    }
  }
  next();
});

// Provide virtual githubHandle pointing to githubUsername to satisfy the stated contract
ContributorSchema.virtual("githubHandle").get(function () {
  return this.githubUsername;
});

// Compound index for querying top contributors
ContributorSchema.index({ totalXp: -1, createdAt: -1 });

const Contributor: Model<ContributorDocumentModel> =
  models?.[DATABASE_MODELS.CONTRIBUTOR] ||
  model<ContributorDocumentModel>(
    DATABASE_MODELS.CONTRIBUTOR,
    ContributorSchema,
  );

export default Contributor;
