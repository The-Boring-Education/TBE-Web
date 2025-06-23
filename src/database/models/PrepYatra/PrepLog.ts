import { type Model,model, models, Schema } from 'mongoose';

import { DATABASE_MODELS } from '@/constant';
import type { PrepLogModel } from '@/interfaces';

const SubLogSchema = new Schema(
  {
    timeGiven: { 
        type: Number, 
        required: true 
    },
    topicCompleted: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
  },
  { 
    timestamps:true
   }
);

const PrepLogSchema = new Schema<PrepLogModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: true,
    },
    title: {
        type: String,
        required: true
    },
    durationDays: { 
        type: Number, 
        required: true 
    },
    tags: [
        { type: String }
    ],
    subLogs: [SubLogSchema],
  },
  { timestamps: true }
);

const PrepLog: Model<PrepLogModel> =
  models?.PrepLog || model<PrepLogModel>(DATABASE_MODELS.PREP_LOG, PrepLogSchema);

export default PrepLog;