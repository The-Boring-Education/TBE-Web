import type { ExternalEmailRequest, OnboardingApp } from "./interfaces";
import { emailTriggerService } from "./triggers";

/** Send a welcome email to a new user. */
export const sendWelcomeEmail = async (data: {
  email: string;
  name: string;
  id: string;
}) =>
  emailTriggerService.sendExternalEmail({
    emailType: "WELCOME",
    userData: { email: data.email, name: data.name, id: data.id },
  });

/**
 * Send an onboarding email. This is the primary trigger used by all TBE apps
 * once a user completes their onboarding flow. Extending onboarding to a new
 * app is a matter of adding it to the `OnboardingApp` union — no changes
 * elsewhere are required.
 */
export const sendOnboardingEmail = async (data: {
  email: string;
  name: string;
  id: string;
  app: OnboardingApp;
  subject?: string;
}) =>
  emailTriggerService.sendExternalEmail({
    emailType: "ONBOARDING",
    userData: { email: data.email, name: data.name, id: data.id },
    additionalData: { app: data.app, subject: data.subject },
  });

/** Send a course enrollment email. */
export const sendCourseEnrollmentEmail = async (data: {
  email: string;
  name: string;
  id: string;
  courseName: string;
  courseDescription?: string;
}) =>
  emailTriggerService.sendExternalEmail({
    emailType: "COURSE_ENROLLMENT",
    userData: { email: data.email, name: data.name, id: data.id },
    additionalData: {
      courseName: data.courseName,
      courseDescription: data.courseDescription,
    },
  });

/** Send a project enrollment email. */
export const sendProjectEnrollmentEmail = async (data: {
  email: string;
  name: string;
  id: string;
  projectName: string;
  projectDescription?: string;
}) =>
  emailTriggerService.sendExternalEmail({
    emailType: "PROJECT_ENROLLMENT",
    userData: { email: data.email, name: data.name, id: data.id },
    additionalData: {
      projectName: data.projectName,
      projectDescription: data.projectDescription,
    },
  });

/** Send an interview prep enrollment email. */
export const sendInterviewPrepEnrollmentEmail = async (data: {
  email: string;
  name: string;
  id: string;
  sheetName: string;
  sheetDescription?: string;
}) =>
  emailTriggerService.sendExternalEmail({
    emailType: "INTERVIEW_PREP_ENROLLMENT",
    userData: { email: data.email, name: data.name, id: data.id },
    additionalData: {
      sheetName: data.sheetName,
      sheetDescription: data.sheetDescription,
    },
  });

/** Send a course completion email. */
export const sendCourseCompletionEmail = async (data: {
  email: string;
  name: string;
  id: string;
  courseName: string;
  courseUrl?: string;
  completionDate: string;
  certificateUrl?: string;
}) =>
  emailTriggerService.sendExternalEmail({
    emailType: "COURSE_COMPLETION",
    userData: { email: data.email, name: data.name, id: data.id },
    additionalData: {
      courseName: data.courseName,
      courseUrl: data.courseUrl,
      completionDate: data.completionDate,
      certificateUrl: data.certificateUrl,
    },
  });

/** Generic escape hatch for callers that already have an ExternalEmailRequest. */
export const sendEmail = async (request: ExternalEmailRequest) =>
  emailTriggerService.sendExternalEmail(request);
