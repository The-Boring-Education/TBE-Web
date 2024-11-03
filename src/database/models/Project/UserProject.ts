import { UserProjectModel, UserProjectSectionModel, UserProjectChapterModel } from '@/interfaces';
import { Model, Schema, model, models } from 'mongoose';
import { databaseModels } from '@/constant';

const UserProjectChapterSchema = new Schema<UserProjectChapterModel>(
  {
    chapterId: {
      type: String,  
      required: [true, 'Chapter ID is required'],
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
    _id: false, 
  }
);

const UserProjectSectionSchema = new Schema<UserProjectSectionModel>(
  {
    sectionId: {
      type: String,  
      required: [true, 'Section ID is required'],
    },
    chapters: [UserProjectChapterSchema],  
  },
  {
    timestamps: true,
    _id: false, 
  }
);

const UserProjectSchema = new Schema<UserProjectModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: databaseModels.USER,
      required: [true, 'User ID is required'],
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: databaseModels.PROJECT,
      required: [true, 'Project ID is required'],
      index: true,
    },
    sections: [UserProjectSectionSchema],  
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
