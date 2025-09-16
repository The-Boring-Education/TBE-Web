import { type Model, model, models, Schema } from 'mongoose';

import { DATABASE_MODELS, NOTIFICATION_TYPE } from '@tbe/constants';
import type { NotificationModel } from '@tbe/interface';

const NotificationSchema: Schema<NotificationModel> = new Schema(
  {
    type: {
      type: String,
      enum: NOTIFICATION_TYPE,
      required: [true, 'Type is required'],
    },
    text: {
      type: String,
      required: true,
    },
    isHTML: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
    },
    isExternalLink: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification: Model<NotificationModel> =
  models?.Notification ||
  model<NotificationModel>(DATABASE_MODELS.NOTIFICATION, NotificationSchema);
export default Notification;
