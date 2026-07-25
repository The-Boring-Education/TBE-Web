import { emailLogger } from "@tbe/constants";

import { emailClient } from "./client";
import { getChitthiConfig } from "./config";
import type {
  CourseCompletionEmailData,
  CourseEnrollmentEmailData,
  EmailTriggerData,
  EmailTriggerType,
  ExternalEmailRequest,
  ExternalEmailResponse,
  InterviewPrepEnrollmentEmailData,
  ProjectEnrollmentEmailData,
} from "./interfaces";
import {
  courseCompletionTemplate,
  courseEnrollmentTemplate,
  interviewPrepEnrollmentTemplate,
  onboardingEmailTemplate,
  projectEnrollmentTemplate,
  welcomeEmailTemplate,
} from "./templates";

type AnyEmailData =
  | EmailTriggerData
  | CourseEnrollmentEmailData
  | ProjectEnrollmentEmailData
  | InterviewPrepEnrollmentEmailData
  | CourseCompletionEmailData;

/**
 * EmailTriggerService is the single extension point for sending emails
 * across all TBE apps. New app onboarding flows should call
 * `sendExternalEmail({ emailType: "ONBOARDING", ..., additionalData: { app } })`
 * — no per-app plumbing is required.
 */
class EmailTriggerService {
  private getDefaults() {
    const { fromEmail, fromName } = getChitthiConfig();
    return { from_email: fromEmail, from_name: fromName };
  }

  private async sendEmailWithTemplate(
    emailType: EmailTriggerType,
    data: AnyEmailData,
    templateFunction: (data: AnyEmailData) => string,
    subject: string,
  ) {
    const requestId = emailLogger.generateRequestId();

    try {
      const htmlContent = templateFunction(data);
      const defaults = this.getDefaults();

      const emailData = {
        ...defaults,
        to_email: data.userEmail,
        to_name: data.userName,
        subject,
        html_content: htmlContent,
      };

      const result = await emailClient.sendEmail(emailData, requestId);

      return {
        success: result.success,
        message: result.success
          ? `${emailType} email sent successfully`
          : "Failed to send email",
        requestId: result.requestId,
        error: result.error,
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      emailLogger.logError(
        requestId,
        data.userEmail,
        error,
        "TEMPLATE_GENERATION",
      );
      return {
        success: false,
        message: "Failed to send email",
        requestId,
        error: err.message || "Unknown error",
      };
    }
  }

  async sendTriggerEmail(trigger: EmailTriggerType, data: AnyEmailData) {
    switch (trigger) {
      case "WELCOME":
        return this.sendEmailWithTemplate(
          trigger,
          data as EmailTriggerData,
          welcomeEmailTemplate as (d: AnyEmailData) => string,
          "Welcome to The Boring Education! 🎉",
        );

      case "COURSE_ENROLLMENT":
        return this.sendEmailWithTemplate(
          trigger,
          data as CourseEnrollmentEmailData,
          courseEnrollmentTemplate as (d: AnyEmailData) => string,
          `Welcome to ${(data as CourseEnrollmentEmailData).courseName}! 🚀`,
        );

      case "PROJECT_ENROLLMENT":
        return this.sendEmailWithTemplate(
          trigger,
          data as ProjectEnrollmentEmailData,
          projectEnrollmentTemplate as (d: AnyEmailData) => string,
          `Welcome to ${(data as ProjectEnrollmentEmailData).projectName}! 🛠️`,
        );

      case "INTERVIEW_PREP_ENROLLMENT":
        return this.sendEmailWithTemplate(
          trigger,
          data as InterviewPrepEnrollmentEmailData,
          interviewPrepEnrollmentTemplate as (d: AnyEmailData) => string,
          `Welcome to ${
            (data as InterviewPrepEnrollmentEmailData).sheetName
          }! 🎯`,
        );

      case "COURSE_COMPLETION":
        return this.sendEmailWithTemplate(
          trigger,
          data as CourseCompletionEmailData,
          courseCompletionTemplate as (d: AnyEmailData) => string,
          `Congratulations! You've completed ${
            (data as CourseCompletionEmailData).courseName
          }! 🏆`,
        );

      case "ONBOARDING": {
        const subject =
          (data.metadata?.subject as string | undefined) ||
          "Welcome to The Boring Education! 🎉";
        return this.sendEmailWithTemplate(
          trigger,
          data,
          onboardingEmailTemplate as unknown as (d: AnyEmailData) => string,
          subject,
        );
      }

      default:
        return {
          success: false,
          message: `Unsupported email trigger: ${trigger}`,
          error: "Invalid email trigger type",
          requestId: undefined,
        };
    }
  }

  async sendExternalEmail(
    request: ExternalEmailRequest,
  ): Promise<ExternalEmailResponse> {
    const { emailType, userData, additionalData } = request;

    try {
      if (!userData.email || !userData.name || !userData.id) {
        return {
          success: false,
          message: "Missing required user data: email, name, or id",
          error: "INVALID_USER_DATA",
        };
      }

      const baseData: EmailTriggerData = {
        userEmail: userData.email,
        userName: userData.name,
        userId: userData.id,
        metadata: additionalData || {},
      };

      let emailData: AnyEmailData = baseData;

      switch (emailType) {
        case "WELCOME":
          emailData = baseData;
          break;

        case "COURSE_ENROLLMENT":
          if (!additionalData?.courseName) {
            return {
              success: false,
              message: "Missing required course data: courseName",
              error: "INVALID_COURSE_DATA",
            };
          }
          emailData = {
            ...baseData,
            courseName: additionalData.courseName as string,
            courseDescription: additionalData.courseDescription as
              string | undefined,
          };
          break;

        case "PROJECT_ENROLLMENT":
          if (!additionalData?.projectName) {
            return {
              success: false,
              message: "Missing required project data: projectName",
              error: "INVALID_PROJECT_DATA",
            };
          }
          emailData = {
            ...baseData,
            projectName: additionalData.projectName as string,
            projectDescription: additionalData.projectDescription as
              string | undefined,
          };
          break;

        case "INTERVIEW_PREP_ENROLLMENT":
          if (!additionalData?.sheetName) {
            return {
              success: false,
              message: "Missing required sheet data: sheetName",
              error: "INVALID_SHEET_DATA",
            };
          }
          emailData = {
            ...baseData,
            sheetName: additionalData.sheetName as string,
            sheetDescription: additionalData.sheetDescription as
              string | undefined,
          };
          break;

        case "COURSE_COMPLETION":
          if (!additionalData?.courseName || !additionalData?.completionDate) {
            return {
              success: false,
              message:
                "Missing required completion data: courseName, completionDate",
              error: "INVALID_COMPLETION_DATA",
            };
          }
          emailData = {
            ...baseData,
            courseName: additionalData.courseName as string,
            completionDate: additionalData.completionDate as string,
            certificateUrl: additionalData.certificateUrl as string | undefined,
          };
          break;

        case "ONBOARDING":
          emailData = {
            ...baseData,
            // `app` is consumed by the onboarding template as a top-level field.
            app: additionalData?.app || "platform",
          } as EmailTriggerData & { app: string };
          break;

        default:
          return {
            success: false,
            message: `Unsupported email type: ${emailType}`,
            error: "INVALID_EMAIL_TYPE",
          };
      }

      const result = await this.sendTriggerEmail(emailType, emailData);

      return {
        success: result.success,
        message: result.message || "Email processed",
        requestId: result.requestId || undefined,
        error: result.error,
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      return {
        success: false,
        message: "Failed to process email request",
        error: err.message || "Unknown error",
      };
    }
  }
}

export const emailTriggerService = new EmailTriggerService();
