import { type Model, model, models, Schema } from 'mongoose';

import { DATABASE_MODELS } from '@/constant';
import type { EmailLog } from '@/interfaces';

export interface EmailLogModel extends Document {
  campaignId?: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  userEmail: string;
  userName: string;
  templateId: Schema.Types.ObjectId;
  subject: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'FAILED' | 'BOUNCED';
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
}

const EmailLogSchema: Schema<EmailLogModel> = new Schema(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'EmailCampaign',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      lowercase: true,
      trim: true,
    },
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'EmailTemplate',
      required: [true, 'Template ID is required'],
    },
    subject: {
      type: String,
      required: [true, 'Email subject is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'FAILED', 'BOUNCED'],
      default: 'PENDING',
    },
    sentAt: Date,
    deliveredAt: Date,
    openedAt: Date,
    clickedAt: Date,
    errorMessage: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
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
EmailLogSchema.index({ campaignId: 1 });
EmailLogSchema.index({ userId: 1 });
EmailLogSchema.index({ status: 1 });
EmailLogSchema.index({ sentAt: -1 });
EmailLogSchema.index({ createdAt: -1 });

const EmailLog: Model<EmailLogModel> =
  models?.EmailLog || model<EmailLogModel>(DATABASE_MODELS.EMAIL_LOG, EmailLogSchema);

export default EmailLog;
