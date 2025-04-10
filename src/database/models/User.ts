import { DATABASE_MODELS } from '@/constant';
import { UserModel } from '@/interfaces';
import { Model, Schema, model, models } from 'mongoose';

const UserSchema: Schema<UserModel> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
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
      required: [true, 'Provider is required'],
    },
    providerAccountId: {
      type: String,
    },
    // New fields for onboarding
    username: {
      type: String,
      unique: true,
      sparse: true, // Allows null values and only enforces uniqueness on non-null values
    },
    profession: {
      type: String,
    },
    platformUsage: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    countryCode: {
      type: String,
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User: Model<UserModel> =
  models?.User || model<UserModel>(DATABASE_MODELS.USER, UserSchema);
export default User;
