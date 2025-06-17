import { type Model, model, models, Schema } from 'mongoose';

import { DATABASE_MODELS, PLATFORM_USAGE, TECH_STACK, USER_ROLE, WORK_DOMAIN } from '@/constant';
import type { UserModel } from '@/interfaces';

const UserSchema: Schema<UserModel> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
    },
    userName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
    },
    image: {
      type: String,
    },
    provider: {
      type: String,
    },
    providerAccountId: {
      type: String,
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    occupation: {
      type: String,
      enum: USER_ROLE,
    },
    purpose: {
      type: [String],
      enum: PLATFORM_USAGE,
    },
    contactNo: {
      type: String,
    },
    workExperience: {
      type: Number,
      min: 0,
    },
    workDomain: {
      type: String,
      enum: WORK_DOMAIN,
    },
    techStack: {
      type: [String],
      enum: TECH_STACK,
    },
  },
  { timestamps: true }
);

const User: Model<UserModel> =
  models?.User || model<UserModel>(DATABASE_MODELS.USER, UserSchema);

export default User;
