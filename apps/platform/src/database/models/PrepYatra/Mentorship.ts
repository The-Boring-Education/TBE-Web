import type { Model, Types } from 'mongoose';
import { model, models, Schema } from 'mongoose';

import { DATABASE_MODELS } from '@/constant';

export interface MentorshipDocumentModel {
  user: Types.ObjectId;
  note?: string;
  selectedAt: Date;
}

const mentorshipSchema: Schema<MentorshipDocumentModel> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    note: { type: String },
    selectedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

const Mentorship: Model<MentorshipDocumentModel> =
  (models as any)?.Mentorship ||
  model<MentorshipDocumentModel>(
    DATABASE_MODELS.MENTORSHIP || 'Mentorship',
    mentorshipSchema
  );

export default Mentorship;
