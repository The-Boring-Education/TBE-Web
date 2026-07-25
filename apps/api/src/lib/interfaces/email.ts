// Re-exports from the shared @tbe/email package. The email domain lives
// entirely in that package so all TBE apps consume the same types and no
// duplicate copies drift out of sync.
import type {
  CourseCompletionEmailData,
  CourseEnrollmentEmailData,
  EmailTriggerData,
  EmailTriggerType,
  InterviewPrepEnrollmentEmailData,
  ProjectEnrollmentEmailData,
} from "@tbe/email";

export type {
  CourseCompletionEmailData,
  CourseEnrollmentEmailData,
  EmailRequest,
  EmailResponse,
  EmailTriggerData,
  EmailTriggerType,
  ExternalEmailRequest,
  ExternalEmailResponse,
  InterviewPrepEnrollmentEmailData,
  OnboardingApp,
  ProjectEnrollmentEmailData,
} from "@tbe/email";

export interface EmailTriggerRequest {
  trigger: EmailTriggerType;
  data:
    | EmailTriggerData
    | CourseEnrollmentEmailData
    | ProjectEnrollmentEmailData
    | InterviewPrepEnrollmentEmailData
    | CourseCompletionEmailData;
}
