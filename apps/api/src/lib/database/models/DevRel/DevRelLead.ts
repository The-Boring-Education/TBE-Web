import type { Document } from 'mongoose';
import { type Model, model, models, Schema } from 'mongoose';


// DevRel Lead Model Interface
export interface DevRelLeadModel extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  email: string;
  role: 'lead';
  status: ApplicationStatusType;
  profileImage?: string;
  
  // Application Data
  applicationData: {
    techStack: string[];
    experienceLevel: string;
    learningFocus: string[];
    availability: string;
    currentRole?: string;
    company?: string;
    linkedinProfile?: string;
    githubProfile?: string;
    portfolioUrl?: string;
    motivation: string;
    previousExperience?: string;
    whyTBE: string;
  };
  
  // Commitment Responses
  commitments: {
    weeklyLearning: boolean;
    communityParticipation: boolean;
    eventAttendance: boolean;
    contentCreation: boolean;
    socialMediaEngagement: boolean;
  };
  
  // Assessment Results
  assessmentResults?: {
    devrelKnowledgeScore: number;
    skillAssessmentScore: number;
    totalScore: number;
    completedAt: Date;
  };
  
  // Interview Data
  interviewData?: {
    scheduledAt?: Date;
    interviewerEmail?: string;
    meetingLink?: string;
    feedback?: string;
    rating?: number;
    completedAt?: Date;
  };
  
  // Onboarding Progress
  onboardingProgress: {
    isStarted: boolean;
    completedTasks: Schema.Types.ObjectId[];
    completionPercentage: number;
    startedAt?: Date;
    completedAt?: Date;
  };
  
  // Performance Metrics
  performanceMetrics: {
    tasksCompleted: number;
    tasksAssigned: number;
    averageCompletionTime: number;
    streakCount: number;
    lastActivityAt?: Date;
  };
  
  reviewedBy?: Schema.Types.ObjectId;
  approvedBy?: Schema.Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  offerSentAt?: Date;
  offerAcceptedAt?: Date;
  onboardedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  updateStatus(status: string, updatedBy?: string): Promise<DevRelLeadModel>;
  
  // Virtual fields
  isOnboarded: boolean;
  canAccessDashboard: boolean;
}

// Types
type ApplicationStatusType = 
  | 'applied' 
  | 'under_review' 
  | 'interview_scheduled' 
  | 'interview_completed' 
  | 'approved' 
  | 'rejected' 
  | 'offer_sent' 
  | 'offer_accepted' 
  | 'onboarded';

const APPLICATION_STATUS = {
  APPLIED: 'applied',
  UNDER_REVIEW: 'under_review',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  INTERVIEW_COMPLETED: 'interview_completed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  OFFER_SENT: 'offer_sent',
  OFFER_ACCEPTED: 'offer_accepted',
  ONBOARDED: 'onboarded',
} as const;

const TECH_STACKS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Next.js', 'Node.js',
  'Express', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Docker', 'Kubernetes',
  'DevOps', 'AI/ML', 'Blockchain', 'Mobile Development', 'UI/UX', 'Data Science',
] as const;

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

const LEARNING_FOCUS = [
  'Frontend Development', 'Backend Development', 'Full Stack Development',
  'DevOps', 'Data Science', 'AI/ML', 'Mobile Development', 'Blockchain',
  'UI/UX Design', 'Product Management', 'Technical Writing', 'Community Building',
] as const;

const AVAILABILITY = [
  '5-10 hours/week', '10-15 hours/week', '15-20 hours/week', '20+ hours/week',
] as const;

// Static methods interface
interface DevRelLeadStatics {
  findByEmail(email: string): Promise<DevRelLeadModel | null>;
  findByStatus(status: string): any; // Mongoose query object
}

// Schemas
const ApplicationDataSchema = new Schema({
  techStack: {
    type: [String],
    enum: TECH_STACKS,
    required: [true, 'Tech stack is required'],
  },
  experienceLevel: {
    type: String,
    enum: EXPERIENCE_LEVELS,
    required: [true, 'Experience level is required'],
  },
  learningFocus: {
    type: [String],
    enum: LEARNING_FOCUS,
    required: [true, 'Learning focus is required'],
  },
  availability: {
    type: String,
    enum: AVAILABILITY,
    required: [true, 'Availability is required'],
  },
  currentRole: String,
  company: String,
  linkedinProfile: String,
  githubProfile: String,
  portfolioUrl: String,
  motivation: {
    type: String,
    required: [true, 'Motivation is required'],
    maxlength: [1000, 'Motivation cannot exceed 1000 characters'],
  },
  previousExperience: {
    type: String,
    maxlength: [1000, 'Previous experience cannot exceed 1000 characters'],
  },
  whyTBE: {
    type: String,
    required: [true, 'Why TBE is required'],
    maxlength: [1000, 'Why TBE cannot exceed 1000 characters'],
  },
}, { _id: false });

const CommitmentsSchema = new Schema({
  weeklyLearning: {
    type: Boolean,
    required: [true, 'Weekly learning commitment is required'],
  },
  communityParticipation: {
    type: Boolean,
    required: [true, 'Community participation commitment is required'],
  },
  eventAttendance: {
    type: Boolean,
    required: [true, 'Event attendance commitment is required'],
  },
  contentCreation: {
    type: Boolean,
    required: [true, 'Content creation commitment is required'],
  },
  socialMediaEngagement: {
    type: Boolean,
    required: [true, 'Social media engagement commitment is required'],
  },
}, { _id: false });

const AssessmentResultsSchema = new Schema({
  devrelKnowledgeScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  skillAssessmentScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  totalScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const InterviewDataSchema = new Schema({
  scheduledAt: Date,
  interviewerEmail: String,
  meetingLink: String,
  feedback: {
    type: String,
    maxlength: [2000, 'Feedback cannot exceed 2000 characters'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
  },
  completedAt: Date,
}, { _id: false });

const OnboardingProgressSchema = new Schema({
  isStarted: {
    type: Boolean,
    default: false,
  },
  completedTasks: [{
    type: Schema.Types.ObjectId,
    ref: 'DevRelTask',
  }],
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  startedAt: Date,
  completedAt: Date,
}, { _id: false });

const PerformanceMetricsSchema = new Schema({
  tasksCompleted: {
    type: Number,
    default: 0,
  },
  tasksAssigned: {
    type: Number,
    default: 0,
  },
  averageCompletionTime: {
    type: Number,
    default: 0,
  },
  streakCount: {
    type: Number,
    default: 0,
  },
  lastActivityAt: Date,
}, { _id: false });

const DevRelLeadSchema = new Schema<DevRelLeadModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      default: 'lead',
      immutable: true,
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.APPLIED,
    },
    profileImage: String,
    
    applicationData: {
      type: ApplicationDataSchema,
      required: [true, 'Application data is required'],
    },
    
    commitments: {
      type: CommitmentsSchema,
      required: [true, 'Commitments are required'],
    },
    
    assessmentResults: AssessmentResultsSchema,
    interviewData: InterviewDataSchema,
    
    onboardingProgress: {
      type: OnboardingProgressSchema,
      default: () => ({}),
    },
    
    performanceMetrics: {
      type: PerformanceMetricsSchema,
      default: () => ({}),
    },
    
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedAt: Date,
    rejectionReason: String,
    offerSentAt: Date,
    offerAcceptedAt: Date,
    onboardedAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
DevRelLeadSchema.index({ email: 1 });
DevRelLeadSchema.index({ status: 1 });
DevRelLeadSchema.index({ createdAt: -1 });

// Virtual fields
DevRelLeadSchema.virtual('isOnboarded').get(function() {
  return this.status === APPLICATION_STATUS.ONBOARDED;
});

DevRelLeadSchema.virtual('canAccessDashboard').get(function() {
  const allowedStatuses = [
    APPLICATION_STATUS.APPROVED,
    APPLICATION_STATUS.OFFER_SENT,
    APPLICATION_STATUS.OFFER_ACCEPTED,
    APPLICATION_STATUS.ONBOARDED
  ] as const;
  return allowedStatuses.includes(this.status as any);
});

// Instance methods
DevRelLeadSchema.methods.updateStatus = function(status: string, updatedBy?: string) {
  this.status = status;
  
  if (status === APPLICATION_STATUS.APPROVED && updatedBy) {
    this.approvedBy = updatedBy;
  }
  
  if (status === APPLICATION_STATUS.REJECTED) {
    this.rejectedAt = new Date();
  }
  
  if (status === APPLICATION_STATUS.OFFER_SENT) {
    this.offerSentAt = new Date();
  }
  
  if (status === APPLICATION_STATUS.OFFER_ACCEPTED) {
    this.offerAcceptedAt = new Date();
  }
  
  if (status === APPLICATION_STATUS.ONBOARDED) {
    this.onboardedAt = new Date();
    this.onboardingProgress.isStarted = true;
    this.onboardingProgress.startedAt = new Date();
  }
  
  return this.save();
};

// Static methods
DevRelLeadSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

DevRelLeadSchema.statics.findByStatus = function(status: string) {
  return this.find({ status });
};

export const DevRelLead: Model<DevRelLeadModel> & DevRelLeadStatics = 
  (models?.DevRelLead || model<DevRelLeadModel>('DevRelLead', DevRelLeadSchema)) as Model<DevRelLeadModel> & DevRelLeadStatics;