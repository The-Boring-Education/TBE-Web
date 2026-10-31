import type { Document } from "mongoose";
import { type Model, model, models, Schema } from "mongoose";

import { TASK_TRACKS } from "./DevRelTask";

// Types
type ContributionTrackType = (typeof TASK_TRACKS)[number];
type ContributionStatusType =
  "pending" | "approved" | "changes_requested" | "rejected";
type ProofKindType =
  | "github_pr"
  | "github_issue"
  | "blog"
  | "tweet"
  | "linkedin"
  | "youtube"
  | "drive"
  | "other";

export const CONTRIBUTION_STATUSES = [
  "pending",
  "approved",
  "changes_requested",
  "rejected",
] as const;

export const PROOF_KINDS = [
  "github_pr",
  "github_issue",
  "blog",
  "tweet",
  "linkedin",
  "youtube",
  "drive",
  "other",
] as const;

export interface ContributionRevision {
  proofUrl: string;
  notes: string;
  submittedAt: Date;
}

// Contribution Model Interface
export interface ContributionModel extends Document {
  _id: Schema.Types.ObjectId;
  leadId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  /** `null` for custom (non-task) contributions. */
  taskId?: Schema.Types.ObjectId | null;
  /** Required when `taskId` is not set. */
  customTitle?: string;
  track: ContributionTrackType;

  proofUrl: string;
  proofKind: ProofKindType;
  notes: string;

  status: ContributionStatusType;
  /** Always 0 unless `status === "approved"`. */
  pointsAwarded: number;

  reviewedBy?: Schema.Types.ObjectId;
  reviewedAt?: Date;
  reviewerFeedback?: string;

  /** Append-only history of superseded submissions. */
  revisions: ContributionRevision[];

  createdAt: Date;
  updatedAt: Date;
}

const RevisionSchema = new Schema<ContributionRevision>(
  {
    proofUrl: {
      type: String,
      required: [true, "Revision proof URL is required"],
      trim: true,
    },
    notes: {
      type: String,
      required: [true, "Revision notes are required"],
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const ContributionSchema = new Schema<ContributionModel>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "DevRelLead",
      required: [true, "Lead is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "DevRelTask",
      default: null,
    },
    customTitle: {
      type: String,
      trim: true,
      maxlength: [200, "Custom title cannot exceed 200 characters"],
      required: [
        function (this: ContributionModel) {
          return !this.taskId;
        },
        "Custom title is required for contributions without a task",
      ],
    },
    track: {
      type: String,
      enum: TASK_TRACKS,
      required: [true, "Track is required"],
    },

    proofUrl: {
      type: String,
      required: [true, "Proof URL is required"],
      trim: true,
    },
    proofKind: {
      type: String,
      enum: PROOF_KINDS,
      required: [true, "Proof kind is required"],
    },
    notes: {
      type: String,
      required: [true, "Notes are required"],
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },

    status: {
      type: String,
      enum: CONTRIBUTION_STATUSES,
      default: "pending",
    },
    pointsAwarded: {
      type: Number,
      min: 0,
      default: 0,
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
    },
    reviewedAt: Date,
    reviewerFeedback: {
      type: String,
      trim: true,
      maxlength: [2000, "Reviewer feedback cannot exceed 2000 characters"],
    },

    revisions: {
      type: [RevisionSchema],
      default: () => [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Indexes
// "My contributions" list
ContributionSchema.index({ leadId: 1, createdAt: -1 });
// Admin review queue
ContributionSchema.index({ status: 1, createdAt: -1 });
// One proof URL per lead — blocks double-submitting the same proof
ContributionSchema.index({ proofUrl: 1, leadId: 1 }, { unique: true });

// Points are only carried by approved contributions
ContributionSchema.pre("validate", function (next) {
  if (this.status !== "approved") {
    this.pointsAwarded = 0;
  }
  next();
});

export const Contribution: Model<ContributionModel> =
  (models?.Contribution as Model<ContributionModel>) ||
  model<ContributionModel>("Contribution", ContributionSchema);
