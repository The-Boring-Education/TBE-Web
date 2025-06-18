import { type Model,model, models, Schema } from 'mongoose';

import { APPLICATION_STATUS, DATABASE_MODELS } from '@/constant';
import type { RecruiterModel } from '@/interfaces';

const RecruiterSchema = new Schema<RecruiterModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: true,
    },
    recruiterName: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    appliedPosition: {
      type: String,
      required: true,
    },
    applicationStatus: {
      type: String,
      enum: APPLICATION_STATUS,
      required: true,
    },
    lastContacted: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Recruiter: Model<RecruiterModel> =
  models?.Recruiter || model<RecruiterModel>(DATABASE_MODELS.RECRUITER, RecruiterSchema);

export default Recruiter;
