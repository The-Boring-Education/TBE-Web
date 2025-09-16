import { type Model, model, models, Schema, Document } from 'mongoose';
import { DATABASE_MODELS } from '@tbe/constants';

// Define the document interface
interface IChallenge extends Document {
  user: Schema.Types.ObjectId;
  name: string;
  totalDays: number;
  currentDay: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSchema = new Schema<IChallenge>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    totalDays: {
      type: Number,
      required: true,
      min: 1,
      max: 365,
    },
    currentDay: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook with proper typing
ChallengeSchema.pre('save', function(this: IChallenge, next) {
  if (this.isModified('totalDays') || this.isNew) {
    this.endDate = new Date(this.startDate);
    this.endDate.setDate(this.startDate.getDate() + this.totalDays);
  }
  next();
});

const Challenge: Model<IChallenge> =
  models?.Challenge ||
  model<IChallenge>(DATABASE_MODELS.CHALLENGE, ChallengeSchema);

export default Challenge;