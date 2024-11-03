import { UserSheetModel , UserSheetQuestionModel} from '@/interfaces';
import { Model, Schema, model, models } from 'mongoose';
import { databaseModels } from '@/constant';

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
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
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
      ref: databaseModels.USER,
      required: [true, 'User ID is required'],
      index: true,
    },
    sheetId: {
      type: Schema.Types.ObjectId,
      ref: databaseModels.INTERVIEW_SHEET,
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
  ref: databaseModels.INTERVIEW_SHEET,
  localField: 'sheetId',
  foreignField: '_id',
  justOne: true,
});

const UserSheet: Model<UserSheetModel> =
  models?.UserSheet ||
  model<UserSheetModel>(databaseModels.USER_SHEET, UserSheetSchema);

export default UserSheet;
