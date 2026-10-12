import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS } from "@/lib/constants";

export interface ContributorModel {
  userId: Schema.Types.ObjectId;
  email: string;
  name: string;
  avatar?: string;
  role: "Contributor" | "TBE Captain";
  totalXp: number;
  approvedCount: number;
  pendingCount: number;
  isCaptain: boolean;
  captainUnlockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContributorSchema = new Schema<ContributorModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ["Contributor", "TBE Captain"],
      default: "Contributor",
    },
    totalXp: {
      type: Number,
      default: 0,
      index: true,
    },
    approvedCount: {
      type: Number,
      default: 0,
    },
    pendingCount: {
      type: Number,
      default: 0,
    },
    isCaptain: {
      type: Boolean,
      default: false,
    },
    captainUnlockedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Contributor: Model<ContributorModel> =
  models[DATABASE_MODELS.CONTRIBUTOR] ||
  model<ContributorModel>(DATABASE_MODELS.CONTRIBUTOR, ContributorSchema);

export default Contributor;
