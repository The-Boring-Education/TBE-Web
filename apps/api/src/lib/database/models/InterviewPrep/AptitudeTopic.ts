import { type Model, model, models, Schema } from 'mongoose';

import {
  APTITUDE_ANSWER_FORMATS,
  APTITUDE_CATEGORIES,
  APTITUDE_SUB_CATEGORIES,
  DATABASE_MODELS,
} from '@/lib/constants';
import type { AptitudeTopicModel } from '@/lib/interfaces';

const AptitudeTopicSchema = new Schema<AptitudeTopicModel>(
  {
    name: {
      type: String,
      required: [true, 'Topic name is required'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
    },
    description: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: APTITUDE_CATEGORIES,
      required: [true, 'Category is required'],
    },
    subCategory: {
      type: String,
      enum: APTITUDE_SUB_CATEGORIES,
      required: [true, 'SubCategory is required'],
    },
    answerFormatType: {
      type: String,
      enum: APTITUDE_ANSWER_FORMATS,
      required: [true, 'Answer format type is required'],
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
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

AptitudeTopicSchema.index({ category: 1 });
AptitudeTopicSchema.index({ subCategory: 1 });
AptitudeTopicSchema.index({ category: 1, subCategory: 1 });
AptitudeTopicSchema.index({ slug: 1 });

const AptitudeTopic: Model<AptitudeTopicModel> =
  models?.AptitudeTopic ||
  model<AptitudeTopicModel>(
    DATABASE_MODELS.APTITUDE_TOPIC,
    AptitudeTopicSchema
  );

export default AptitudeTopic;
