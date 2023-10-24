import { CohortLeadDocumentModel } from '@/interfaces';
import mongoose, { Model, Schema } from 'mongoose';

const cohortLeadSchema: Schema<CohortLeadDocumentModel> =
  new Schema<CohortLeadDocumentModel>(
    {
      name: { type: String, required: true },
      email: { type: String },
      contactNo: { type: String, required: true },
      cohortName: { type: String },
      profession: { type: String },
      school: { type: String },
      college: { type: String },
      workExperience: { type: Number },
      status: { type: String, default: 'Pending' },
    },
    { timestamps: true }
  );

const CohortLead: Model<CohortLeadDocumentModel> =
  mongoose.models.CohortLead ||
  mongoose.model<CohortLeadDocumentModel>('CohortLead', cohortLeadSchema);

export default CohortLead;
