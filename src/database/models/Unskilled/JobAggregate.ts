import { DATABASE_MODELS } from '@/constant';
import { JobAggregateModel } from '@/interfaces';
import { Model, Schema, model, models } from 'mongoose';

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
