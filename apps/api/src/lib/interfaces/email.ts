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
