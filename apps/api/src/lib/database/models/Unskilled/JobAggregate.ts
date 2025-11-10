import { type Model, model, models, Schema } from 'mongoose';

import { DATABASE_MODELS } from '@/lib/constants';
import type { JobAggregateModel } from '@/lib/interfaces';

const JobAggregateSchema = new Schema<JobAggregateModel>(
  {
    trendingSkills: [
      {
        _id: false,
        name: String,
        count: Number,
      },
    ],
    topLocations: [
      {
        _id: false,
        name: String,
        count: Number,
      },
    ],
    jobDomains: [
      {
        _id: false,
        name: String,
        count: Number,
      },
    ],
    companyTypes: [
      {
        _id: false,
        name: String,
        count: Number,
      },
    ],
  },
  { timestamps: true }
);

const JobAggregate: Model<JobAggregateModel> =
  models.JobAggregate ||
  model(DATABASE_MODELS.JOB_AGGREGATE, JobAggregateSchema);

export default JobAggregate;
