export * from "./api";
export * from "./base";
export * from "./challenges";
// Email service moved to a dedicated package (`@tbe/email`). Re-export the
// commonly used surface here so historical callers keep working without
// duplicating provider/template logic across packages.
export * from "./prep-logs";
export * from "./prep-stats";
export * from "./quizApi";
export * from "./recruiters";
export * from "./resumeService";
export * from "./user";
export {
  courseCompletionTemplate,
  courseEnrollmentTemplate,
  emailClient,
  emailTriggerService,
  interviewPrepEnrollmentTemplate,
  onboardingEmailTemplate,
  projectEnrollmentTemplate,
  sendCourseCompletionEmail,
  sendCourseEnrollmentEmail,
  sendEmail,
  sendInterviewPrepEnrollmentEmail,
  sendOnboardingEmail,
  sendProjectEnrollmentEmail,
  sendWelcomeEmail,
  welcomeEmailTemplate,
} from "@tbe/email";
