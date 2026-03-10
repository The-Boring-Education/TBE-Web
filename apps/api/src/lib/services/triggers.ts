import { envConfig } from "@/lib/constants";
import { emailLogger } from "@/lib/constants";
import type {
  CourseCompletionEmailData,
  CourseEnrollmentEmailData,
  EmailTriggerData,
  EmailTriggerType,
  ExternalEmailRequest,
  ExternalEmailResponse,
  InterviewPrepEnrollmentEmailData,
  ProjectEnrollmentEmailData,
} from "@/lib/interfaces";

import { emailClient } from "./client";
import {
  courseCompletionTemplate,
  courseEnrollmentTemplate,
  interviewPrepEnrollmentTemplate,
  projectEnrollmentTemplate,
  welcomeEmailTemplate,
} from "./templates";

class EmailTriggerService {
  private getDefaultFromEmail(): string {
    return envConfig.FROM_EMAIL || "theboringeducation@gmail.com";
  }

  private getDefaultFromName(): string {
    return "TBE";
  }

  private async sendEmailWithTemplate(
    emailType: EmailTriggerType,
    data:
      | EmailTriggerData
      | CourseEnrollmentEmailData
      | ProjectEnrollmentEmailData
      | InterviewPrepEnrollmentEmailData
      | CourseCompletionEmailData,
    templateFunction: (data: any) => string,
    subject: string,
  ) {
    const requestId = emailLogger.generateRequestId();

    try {
      const htmlContent = templateFunction(data);

      const emailData = {
        from_email: this.getDefaultFromEmail(),
        from_name: this.getDefaultFromName(),
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
    } catch (error: any) {
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
        error: error.message || "Unknown error",
      };
    }
  }

  async sendTriggerEmail(
    trigger: EmailTriggerType,
    data:
      | EmailTriggerData
      | CourseEnrollmentEmailData
      | ProjectEnrollmentEmailData
      | InterviewPrepEnrollmentEmailData
      | CourseCompletionEmailData,
  ) {
    switch (trigger) {
      case "WELCOME":
        return this.sendEmailWithTemplate(
          trigger,
          data as EmailTriggerData,
          welcomeEmailTemplate,
          "Welcome to The Boring Education! 🎉",
        );

      case "COURSE_ENROLLMENT":
        return this.sendEmailWithTemplate(
          trigger,
          data as CourseEnrollmentEmailData,
          courseEnrollmentTemplate,
          `Welcome to ${(data as CourseEnrollmentEmailData).courseName}! 🚀`,
        );

      case "PROJECT_ENROLLMENT":
        return this.sendEmailWithTemplate(
          trigger,
          data as ProjectEnrollmentEmailData,
          projectEnrollmentTemplate,
          `Welcome to ${(data as ProjectEnrollmentEmailData).projectName}! 🛠️`,
        );

      case "INTERVIEW_PREP_ENROLLMENT":
        return this.sendEmailWithTemplate(
          trigger,
          data as InterviewPrepEnrollmentEmailData,
          interviewPrepEnrollmentTemplate,
          `Welcome to ${
            (data as InterviewPrepEnrollmentEmailData).sheetName
          }! 🎯`,
        );

      case "COURSE_COMPLETION":
        return this.sendEmailWithTemplate(
          trigger,
          data as CourseCompletionEmailData,
          courseCompletionTemplate,
          `Congratulations! You've completed ${
            (data as CourseCompletionEmailData).courseName
          }! 🏆`,
        );

      default:
        return {
          success: false,
          message: `Unsupported email trigger: ${trigger}`,
          error: "Invalid email trigger type",
          requestId: undefined,
        };
    }
  }

  // New method for external API usage
  async sendExternalEmail(
    request: ExternalEmailRequest,
  ): Promise<ExternalEmailResponse> {
    const { emailType, userData, additionalData } = request;

    try {
      // Validate required data
      if (!userData.email || !userData.name || !userData.id) {
        return {
          success: false,
          message: "Missing required user data: email, name, or id",
          error: "INVALID_USER_DATA",
        };
      }

      // Create base data object
      const baseData = {
        userEmail: userData.email,
        userName: userData.name,
        userId: userData.id,
        metadata: additionalData || {},
      };

      // Create specific data object based on email type
      let emailData: any = baseData;

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
            courseName: additionalData.courseName,
            courseDescription: additionalData.courseDescription,
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
            projectName: additionalData.projectName,
            projectDescription: additionalData.projectDescription,
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
            sheetName: additionalData.sheetName,
            sheetDescription: additionalData.sheetDescription,
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
            courseName: additionalData.courseName,
            completionDate: additionalData.completionDate,
            certificateUrl: additionalData.certificateUrl,
          };
          break;

        default:
          return {
            success: false,
            message: `Unsupported email type: ${emailType}`,
            error: "INVALID_EMAIL_TYPE",
          };
      }

      // Send the email
      const result = await this.sendTriggerEmail(emailType, emailData);

      return {
        success: result.success,
        message: result.message || "Email processed",
        requestId: result.requestId || undefined,
        error: result.error,
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to process email request",
        error: error.message || "Unknown error",
      };
    }
  }
}

export const emailTriggerService = new EmailTriggerService();
