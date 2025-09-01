import { type Model, model, models, Schema } from 'mongoose';

import { DATABASE_MODELS } from '@/constant';
import type { EmailTemplate } from '@/interfaces';

export interface EmailTemplateModel extends Document {
  name: string;
  subject: string;
  htmlContent: string;
  variables: string[];
  category: 'PROGRESS_APPRAISAL' | 'LEARNING_ENCOURAGEMENT' | 'COMMUNITY_INVITATION' | 'CHANGELOG';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const EmailTemplateSchema: Schema<EmailTemplateModel> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Email subject is required'],
      trim: true,
    },
    htmlContent: {
      type: String,
      required: [true, 'HTML content is required'],
    },
    variables: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      enum: ['PROGRESS_APPRAISAL', 'LEARNING_ENCOURAGEMENT', 'COMMUNITY_INVITATION', 'CHANGELOG'],
      required: [true, 'Template category is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for better query performance
EmailTemplateSchema.index({ category: 1 });
EmailTemplateSchema.index({ isActive: 1 });
EmailTemplateSchema.index({ name: 1 });

const EmailTemplate: Model<EmailTemplateModel> =
  models?.EmailTemplate || model<EmailTemplateModel>(DATABASE_MODELS.EMAIL_TEMPLATE, EmailTemplateSchema);

export default EmailTemplate;
