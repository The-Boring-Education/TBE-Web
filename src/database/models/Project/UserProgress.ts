import { UserProgressModel } from '@/interfaces';
import { Model, Schema, model, models } from 'mongoose';
import { databaseModels } from '@/constant';

const UserTaskSchema = new Schema(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: databaseModels.USER_PROJECT_PROGRESS,
      required: [true, 'Task id is required'],
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
    _id: false, // We don't need an _id field for each task
  }
);

const UserProjectSchema = new Schema<UserProgressModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: databaseModels.USER,
      required: [true, 'User id is required'],
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: databaseModels.PROJECT,
      required: [true, 'Project id is required'],
      index: true,
    },
    tasks: [UserTaskSchema],
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

UserProjectSchema.virtual('project', {
  ref: databaseModels.PROJECT,
  localField: 'projectId',
  foreignField: '_id',
  justOne: true,
});

const UserProject: Model<UserProgressModel> =
  models?.UserProject ||
  model<UserProgressModel>(databaseModels.USER_PROGRESS, UserProjectSchema);

export default UserProject;
