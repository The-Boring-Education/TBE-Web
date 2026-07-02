import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS } from "@/lib/constants";
import type { AdminUserModel } from "@/lib/interfaces";

const AdminUserSchema = new Schema<AdminUserModel>(
  {
    email: {
      type: String,
      required: [true, "Admin email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: [120, "Name cannot exceed 120 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    addedBy: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
    _id: true,
    toObject: {
      transform: (_doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
  },
);

AdminUserSchema.index({ isActive: 1, email: 1 });

const AdminUser: Model<AdminUserModel> =
  models?.AdminUser ||
  model<AdminUserModel>(DATABASE_MODELS.ADMIN_USER, AdminUserSchema);

export default AdminUser;
