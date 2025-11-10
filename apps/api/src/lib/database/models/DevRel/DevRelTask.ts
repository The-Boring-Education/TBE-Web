import type { Document } from 'mongoose';
import { type Model, model, models, Schema } from 'mongoose';

// DevRel Task Model Interface
export interface DevRelTaskModel extends Document {
  _id: Schema.Types.ObjectId;
  title: string;
  description: string;
  type: TaskType;
  priority: 'low' | 'medium' | 'high';
  
  // Assignment
  assignedTo?: Schema.Types.ObjectId[];
  assignedToAll?: boolean;
  createdBy: Schema.Types.ObjectId;
  
  // Timing
  dueDate?: Date;
  estimatedHours?: number;
  
  // Status Tracking
  status: TaskStatusType;
  completionTracking: Map<string, {
    status: TaskStatusType;
    startedAt?: Date;
    completedAt?: Date;
    notes?: string;
    submissionUrl?: string;
    reviewStatus?: 'pending' | 'approved' | 'needs_revision';
    reviewNotes?: string;
    reviewedBy?: Schema.Types.ObjectId;
    reviewedAt?: Date;
  }>;
  
  // Task Details
  requirements?: string[];
  resources?: {
    title: string;
    url: string;
    type: 'link' | 'document' | 'video';
  }[];
  
  // Submission Requirements
  submissionRequired: boolean;
  submissionType?: 'url' | 'text' | 'file';
  submissionInstructions?: string;
  
  tags?: string[];
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  getLeadStatus(leadId: string): { status: TaskStatusType; startedAt?: Date; completedAt?: Date; notes?: string; submissionUrl?: string; reviewStatus?: 'pending' | 'approved' | 'needs_revision'; reviewNotes?: string; reviewedBy?: Schema.Types.ObjectId; };
  updateLeadProgress(leadId: string, status: string, data?: { notes?: string; submissionUrl?: string; reviewStatus?: string; reviewNotes?: string; reviewedBy?: string; }): Promise<DevRelTaskModel>;
}

// Types
type TaskStatusType = 'pending' | 'in_progress' | 'completed' | 'overdue';
type TaskType = 'onboarding' | 'weekly' | 'special' | 'training';

const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
} as const;

const TASK_TYPES = {
  ONBOARDING: 'onboarding',
  WEEKLY: 'weekly',
  SPECIAL: 'special',
  TRAINING: 'training',
} as const;

// Static methods interface
interface DevRelTaskStatics {
  findByType(type: string): any; // Mongoose query object
  findForLead(leadId: string): any; // Mongoose query object
}

// Schemas
const ResourceSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
  },
  url: {
    type: String,
    required: [true, 'Resource URL is required'],
  },
  type: {
    type: String,
    enum: ['link', 'document', 'video'],
    required: [true, 'Resource type is required'],
  },
}, { _id: false });

const DevRelTaskSchema = new Schema<DevRelTaskModel>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(TASK_TYPES),
      required: [true, 'Task type is required'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    
    // Assignment
    assignedTo: [{
      type: Schema.Types.ObjectId,
      ref: 'DevRelLead',
    }],
    assignedToAll: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task creator is required'],
    },
    
    // Timing
    dueDate: Date,
    estimatedHours: {
      type: Number,
      min: 0,
    },
    
    // Status Tracking
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.PENDING,
    },
    completionTracking: {
      type: Map,
      of: {
        status: {
          type: String,
          enum: Object.values(TASK_STATUS),
          default: TASK_STATUS.PENDING,
        },
        startedAt: Date,
        completedAt: Date,
        notes: String,
        submissionUrl: String,
        reviewStatus: {
          type: String,
          enum: ['pending', 'approved', 'needs_revision'],
        },
        reviewNotes: String,
        reviewedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        reviewedAt: Date,
      },
      default: () => new Map(),
    },
    
    // Task Details
    requirements: [String],
    resources: [ResourceSchema],
    
    // Submission Requirements
    submissionRequired: {
      type: Boolean,
      default: false,
    },
    submissionType: {
      type: String,
      enum: ['url', 'text', 'file'],
    },
    submissionInstructions: String,
    
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        // Convert Map to Object for JSON serialization
        if (ret.completionTracking instanceof Map) {
          ret.completionTracking = Object.fromEntries(ret.completionTracking);
        }
        return ret;
      },
    },
  }
);

// Indexes
DevRelTaskSchema.index({ type: 1 });
DevRelTaskSchema.index({ status: 1 });
DevRelTaskSchema.index({ createdBy: 1 });
DevRelTaskSchema.index({ assignedTo: 1 });
DevRelTaskSchema.index({ dueDate: 1 });
DevRelTaskSchema.index({ isActive: 1 });

// Virtual fields
DevRelTaskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && new Date() > this.dueDate && this.status !== TASK_STATUS.COMPLETED;
});

// Instance methods
DevRelTaskSchema.methods.assignToLead = function(leadId: string) {
  if (!this.assignedTo.includes(leadId)) {
    this.assignedTo.push(leadId);
    this.completionTracking.set(leadId, {
      status: TASK_STATUS.PENDING,
    });
  }
  return this.save();
};

DevRelTaskSchema.methods.updateLeadProgress = function(
  leadId: string, 
  status: string, 
  data: any = {}
) {
  const tracking = this.completionTracking.get(leadId) || {};
  
  tracking.status = status;
  
  if (status === TASK_STATUS.IN_PROGRESS && !tracking.startedAt) {
    tracking.startedAt = new Date();
  }
  
  if (status === TASK_STATUS.COMPLETED) {
    tracking.completedAt = new Date();
  }
  
  // Merge additional data
  Object.assign(tracking, data);
  
  this.completionTracking.set(leadId, tracking);
  
  return this.save();
};

DevRelTaskSchema.methods.getLeadStatus = function(leadId: string) {
  return this.completionTracking.get(leadId) || { status: TASK_STATUS.PENDING };
};

// Static methods
DevRelTaskSchema.statics.findByType = function(type: string) {
  return this.find({ type, isActive: true }).sort({ createdAt: -1 });
};

DevRelTaskSchema.statics.findForLead = function(leadId: string) {
  return this.find({
    $or: [
      { assignedTo: leadId },
      { assignedToAll: true }
    ],
    isActive: true
  }).sort({ dueDate: 1, createdAt: -1 });
};

export const DevRelTask: Model<DevRelTaskModel> & DevRelTaskStatics = 
  (models?.DevRelTask || model<DevRelTaskModel>('DevRelTask', DevRelTaskSchema)) as Model<DevRelTaskModel> & DevRelTaskStatics;