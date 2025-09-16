import { type Model, model, models, Schema } from 'mongoose';

import { CERTIFICATE_TYPE, DATABASE_MODELS } from '@tbe/constants';
import type { CertificateModel } from '@tbe/interface'; 

const CertificateSchema = new Schema<CertificateModel>(
  {
    type: {
      type: String,
      enum: CERTIFICATE_TYPE,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    programName: {
      type: String,
      required: true,
    },
    programId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    _id: true,
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
  }
);

const Certificate: Model<CertificateModel> =
  models?.Certificate ||
  model<CertificateModel>(DATABASE_MODELS.CERTIFICATE, CertificateSchema);

export default Certificate;
