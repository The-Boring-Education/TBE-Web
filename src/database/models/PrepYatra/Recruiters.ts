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
    email:{
      type:String,
    },
     phone:{
      type:String,
    },
    company: {
      type: String,
    },
    appliedPosition: {
      type: String,
    },
    applicationStatus: {
      type: String,
      enum: APPLICATION_STATUS,
    },
    lastContacted: {
      type: String,
    },
    comments:{
      type: String,
    },
    follow_up_date:{
      type:String,
    },
    last_interview_date:{
      type:String
    },
    link:{
      type:String,
    }
  },
  { timestamps: true }
);

const Recruiter: Model<RecruiterModel> =
   models[DATABASE_MODELS.RECRUITER] || model<RecruiterModel>(DATABASE_MODELS.RECRUITER, RecruiterSchema);

export default Recruiter;
