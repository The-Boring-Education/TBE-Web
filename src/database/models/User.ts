import { DATABASE_MODELS, USER_ROLE, PLATFORM_USAGE } from '@/constant';
import { UserModel } from '@/interfaces';
import { Model, Schema, model, models } from 'mongoose';

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
  },
  { timestamps: true }
);

const User: Model<UserModel> =
  models?.User || model<UserModel>(DATABASE_MODELS.USER, UserSchema);

export default User;
