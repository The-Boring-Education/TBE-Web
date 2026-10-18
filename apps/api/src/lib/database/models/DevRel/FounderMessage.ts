import type { Document } from "mongoose";
import { type Model, model, models, Schema } from "mongoose";

import { CONTRIBUTOR_TIERS } from "./DevRelLead";

// Types
type ContributorTierType = (typeof CONTRIBUTOR_TIERS)[number];
type FounderMessageCategoryType =
  "mentorship" | "proposal" | "task_blocker" | "general";
type FounderMessagePriorityType = "normal" | "high";

export const FOUNDER_MESSAGE_CATEGORIES = [
  "mentorship",
  "proposal",
  "task_blocker",
  "general",
] as const;

export const FOUNDER_MESSAGE_PRIORITIES = ["normal", "high"] as const;

// FounderMessage Model Interface
export interface FounderMessageModel extends Document {
  _id: Schema.Types.ObjectId;
  leadId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  tierAtSendTime: ContributorTierType;
  category: FounderMessageCategoryType;
  subject: string;
  body: string;
  /** Set by the escalation router at write time, never by the lead. */
  priority: FounderMessagePriorityType;

  resolvedAt?: Date;
  resolvedBy?: Schema.Types.ObjectId;
  resolutionNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const FounderMessageSchema = new Schema<FounderMessageModel>(
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
    tierAtSendTime: {
      type: String,
      enum: CONTRIBUTOR_TIERS,
      required: [true, "Tier at send time is required"],
    },
    category: {
      type: String,
      enum: FOUNDER_MESSAGE_CATEGORIES,
      required: [true, "Category is required"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    body: {
      type: String,
      required: [true, "Body is required"],
      trim: true,
      maxlength: [2000, "Body cannot exceed 2000 characters"],
    },
    priority: {
      type: String,
      enum: FOUNDER_MESSAGE_PRIORITIES,
      default: "normal",
    },

    resolvedAt: Date,
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
    },
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: [2000, "Resolution notes cannot exceed 2000 characters"],
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

// Admin inbox: open first, high priority first, oldest first
FounderMessageSchema.index({ resolvedAt: 1, priority: -1, createdAt: 1 });

export const FounderMessage: Model<FounderMessageModel> =
  (models?.FounderMessage as Model<FounderMessageModel>) ||
  model<FounderMessageModel>("FounderMessage", FounderMessageSchema);
