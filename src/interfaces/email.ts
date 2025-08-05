export interface EmailRequest {
  from_email: string;
  to_email: string;
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
  sheetUrl: string;
}

export type EmailTriggerType =
  | 'WELCOME'
  | 'COURSE_ENROLLMENT'
  | 'PROJECT_ENROLLMENT'
  | 'INTERVIEW_PREP_ENROLLMENT';

export interface EmailTriggerRequest {
  trigger: EmailTriggerType;
  data:
    | EmailTriggerData
    | CourseEnrollmentEmailData
    | ProjectEnrollmentEmailData
    | InterviewPrepEnrollmentEmailData;
}
