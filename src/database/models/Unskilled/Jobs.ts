import { type Model, model, models, Schema } from 'mongoose';

import { DATABASE_MODELS } from '@/constant';
import type { JobModel } from '@/interfaces';

const JobSchema: Schema<JobModel> = new Schema(
  {
    job_id: { type: String, required: true },
    job_title: { type: String, required: true },
    job_description: { type: String, required: true },
    company: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String },
      location: { type: String },
      linkedIn: { type: String },
      website: { type: String },
      description: { type: String },
      logo: { type: String },
      emp_count: { type: Number },
      company_founded: { type: Number },
    },
    skills: [{ type: String, required: true }],
    role: [{ type: String, required: true }],
    location: [{ type: String, required: true }],
    experience: {
      min: { type: Number },
      max: { type: Number },
    },
    jobUrl: { type: String, required: true },
    salary: {
      min: { type: String },
      max: { type: String },
    },
    isInternship: { type: Boolean, default: false },
    platform: { type: String, required: true },
    postedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Job: Model<JobModel> =
  models?.Job || model<JobModel>(DATABASE_MODELS.JOB, JobSchema);
export default Job;
