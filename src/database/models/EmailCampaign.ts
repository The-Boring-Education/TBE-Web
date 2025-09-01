import { type Model, model, models, Schema } from 'mongoose';

import { DATABASE_MODELS } from '@/constant';
import type { EmailCampaign } from '@/interfaces';

export interface EmailCampaignModel extends Document {
  name: string;
  templateId: Schema.Types.ObjectId;
  subject: string;
  htmlContent: string;
  targetAudience: {
    segment: 'ALL_LEARNERS' | 'ACTIVE_LEARNERS' | 'INACTIVE_LEARNERS' | 'HIGH_PERFORMERS' | 'NEW_LEARNERS';
    filters?: {
      lastActivityDays?: number;
      completionRate?: number;
      signupDays?: number;
    };
  };
  schedule: {
    type: 'IMMEDIATE' | 'SCHEDULED' | 'RECURRING';
    scheduledAt?: Date;
    recurring?: {
      frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
      time: string;
      timezone: string;
    };
  };
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'PAUSED';
  stats: {
    totalRecipients: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  };
  createdBy?: Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Sub-schemas for better organization
const TargetAudienceSchema = new Schema({
  segment: {
    type: String,
    enum: ['ALL_LEARNERS', 'ACTIVE_LEARNERS', 'INACTIVE_LEARNERS', 'HIGH_PERFORMERS', 'NEW_LEARNERS'],
    required: [true, 'Target segment is required'],
  },
  filters: {
    lastActivityDays: Number,
    completionRate: Number,
    signupDays: Number,
  },
}, { _id: false });

const RecurringScheduleSchema = new Schema({
  frequency: {
    type: String,
    enum: ['DAILY', 'WEEKLY', 'MONTHLY'],
    required: true,
  },
  time: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Time must be in HH:MM format',
    },
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata',
  },
}, { _id: false });

const ScheduleSchema = new Schema({
  type: {
    type: String,
    enum: ['IMMEDIATE', 'SCHEDULED', 'RECURRING'],
    required: [true, 'Schedule type is required'],
  },
  scheduledAt: Date,
  recurring: RecurringScheduleSchema,
}, { _id: false });

const StatsSchema = new Schema({
  totalRecipients: {
    type: Number,
    default: 0,
  },
  sent: {
    type: Number,
    default: 0,
  },
  delivered: {
    type: Number,
    default: 0,
  },
  opened: {
    type: Number,
    default: 0,
  },
  clicked: {
    type: Number,
    default: 0,
  },
  failed: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const EmailCampaignSchema: Schema<EmailCampaignModel> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
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
    htmlContent: {
      type: String,
      required: [true, 'HTML content is required'],
    },
    targetAudience: {
      type: TargetAudienceSchema,
      required: [true, 'Target audience is required'],
    },
    schedule: {
      type: ScheduleSchema,
      required: [true, 'Schedule is required'],
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SCHEDULED', 'SENDING', 'COMPLETED', 'PAUSED'],
      default: 'DRAFT',
    },
    stats: {
      type: StatsSchema,
      default: () => ({}),
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
EmailCampaignSchema.index({ status: 1 });
EmailCampaignSchema.index({ 'schedule.type': 1 });
EmailCampaignSchema.index({ 'schedule.scheduledAt': 1 });
EmailCampaignSchema.index({ createdAt: -1 });

const EmailCampaign: Model<EmailCampaignModel> =
  models?.EmailCampaign || model<EmailCampaignModel>(DATABASE_MODELS.EMAIL_CAMPAIGN, EmailCampaignSchema);

export default EmailCampaign;
