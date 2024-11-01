import { Model, Schema, model, models } from 'mongoose';
import { databaseModels } from '@/constant';
import { UserProjectModel } from '@/interfaces';

const UserTaskSchema = new Schema(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: databaseModels.PROJECT_TASK,
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

const UserProjectSchema = new Schema<UserProjectModel>(
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

const UserProject: Model<UserProjectModel> =
  models?.UserProject ||
  model<UserProjectModel>(databaseModels.USER_PROJECT, UserProjectSchema);

export default UserProject;
