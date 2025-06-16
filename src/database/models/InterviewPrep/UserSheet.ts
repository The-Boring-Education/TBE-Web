import { type Model,model, models, Schema } from 'mongoose';

import { DATABASE_MODELS } from '@/constant';
import type { UserSheetModel, UserSheetQuestionModel } from '@/interfaces';

const UserQuestionSchema = new Schema<UserSheetQuestionModel>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Question ID is required'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    _id: true, // We need an _id field for each question
  }
);

const UserSheetSchema = new Schema<UserSheetModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, 'User ID is required'],
      index: true,
    },
    sheetId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.INTERVIEW_SHEET,
      required: [true, 'Sheet ID is required'],
      index: true,
    },
    questions: [UserQuestionSchema],
  },
  {
    timestamps: true,
    _id: true,
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
  }
);

UserSheetSchema.virtual('sheet', {
  ref: DATABASE_MODELS.INTERVIEW_SHEET,
  localField: 'sheetId',
  foreignField: '_id',
  justOne: true,
});

const UserSheet: Model<UserSheetModel> =
  models?.UserSheet ||
  model<UserSheetModel>(DATABASE_MODELS.USER_SHEET, UserSheetSchema);

export default UserSheet;
