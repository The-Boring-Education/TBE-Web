export interface EmailRequest {
  from_email: string;
  from_name?: string;
  to_email: string;
  to_name?: string;
  subject: string;
  html_content: string;
}

export interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  requestId?: string;
}

export interface EmailTriggerData {
  userEmail: string;
  userName: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface CourseEnrollmentEmailData extends EmailTriggerData {
  courseName: string;
  courseDescription?: string;
  courseUrl: string;
}

export interface ProjectEnrollmentEmailData extends EmailTriggerData {
  projectName: string;
  projectDescription?: string;
  projectUrl: string;
}

export interface InterviewPrepEnrollmentEmailData extends EmailTriggerData {
  sheetName: string;
  sheetDescription?: string;
}

export interface CourseCompletionEmailData extends EmailTriggerData {
  courseName: string;
  courseUrl: string;
  completionDate: string;
  certificateUrl?: string;
}

export type EmailTriggerType =
  | 'WELCOME'
  | 'COURSE_ENROLLMENT'
  | 'PROJECT_ENROLLMENT'
  | 'INTERVIEW_PREP_ENROLLMENT'
  | 'COURSE_COMPLETION';

export interface EmailTriggerRequest {
  trigger: EmailTriggerType;
  data:
    | EmailTriggerData
    | CourseEnrollmentEmailData
    | ProjectEnrollmentEmailData
    | InterviewPrepEnrollmentEmailData
    | CourseCompletionEmailData;
}

// New interfaces for external API usage
export interface ExternalEmailRequest {
  emailType: EmailTriggerType;
  userData: {
    email: string;
    name: string;
    id: string;
  };
  additionalData?: Record<string, any>;
}

export interface ExternalEmailResponse {
  success: boolean;
  message: string;
  requestId?: string;
  error?: string;
}

// New interfaces for automated email campaigns
export interface EmailTemplate {
  _id?: string;
  name: string;
  subject: string;
  htmlContent: string;
  variables: string[]; // Template variables like {{userName}}, {{progress}}, etc.
  category: 'PROGRESS_APPRAISAL' | 'LEARNING_ENCOURAGEMENT' | 'COMMUNITY_INVITATION' | 'CHANGELOG';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmailCampaign {
  _id?: string;
  name: string;
  templateId: string;
  subject: string;
  htmlContent: string;
  targetAudience: {
    segment: 'ALL_LEARNERS' | 'ACTIVE_LEARNERS' | 'INACTIVE_LEARNERS' | 'HIGH_PERFORMERS' | 'NEW_LEARNERS';
    filters?: {
      lastActivityDays?: number;
      completionRate?: number;
      signupDays?: number;
    };
  };
  schedule: {
    type: 'IMMEDIATE' | 'SCHEDULED' | 'RECURRING';
    scheduledAt?: Date;
    recurring?: {
      frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
      time: string; // "10:00" for 10 AM
      timezone: string;
    };
  };
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'PAUSED';
  stats: {
    totalRecipients: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  };
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmailLog {
  _id?: string;
  campaignId?: string;
  userId: string;
  userEmail: string;
  userName: string;
  templateId: string;
  subject: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'FAILED' | 'BOUNCED';
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
}

export interface BulkEmailRequest {
  campaignId?: string;
  templateId: string;
  segment: 'ALL_LEARNERS' | 'ACTIVE_LEARNERS' | 'INACTIVE_LEARNERS' | 'HIGH_PERFORMERS' | 'NEW_LEARNERS';
  filters?: {
    lastActivityDays?: number;
    completionRate?: number;
    signupDays?: number;
    limit?: number;
  };
  customSubject?: string;
  customContent?: string;
  variables?: Record<string, any>;
}

export interface EmailAnalytics {
  totalCampaigns: number;
  totalEmailsSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  averageOpenRate: number;
  averageClickRate: number;
  topPerformingTemplates: Array<{
    templateId: string;
    templateName: string;
    sentCount: number;
    openRate: number;
    clickRate: number;
  }>;
  recentActivity: Array<{
    date: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  }>;
}

export interface LearnerSegment {
  segment: string;
  count: number;
  users: Array<{
    _id: string;
    name: string;
    email: string;
    lastActivity?: Date;
    completionRate?: number;
    signupDate?: Date;
  }>;
}
