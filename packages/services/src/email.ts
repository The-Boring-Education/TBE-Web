import { emailLogger } from '@tbe/constants';
import type { ExternalEmailRequest } from '@tbe/interface';

import { emailTriggerService } from './triggers';

/**
 * Send a welcome email to a new user
 */
export const sendWelcomeEmail = async (data: {
  email: string;
  name: string;
  id: string;
}) => {
  const request: ExternalEmailRequest = {
    emailType: 'WELCOME',
    userData: {
      email: data.email,
      name: data.name,
      id: data.id,
    },
  };

  return emailTriggerService.sendExternalEmail(request);
};

/**
 * Send a course enrollment email
 */
export const sendCourseEnrollmentEmail = async (data: {
  email: string;
  name: string;
  id: string;
  courseName: string;
  courseDescription?: string;
}) => {
  const request: ExternalEmailRequest = {
    emailType: 'COURSE_ENROLLMENT',
    userData: {
      email: data.email,
      name: data.name,
      id: data.id,
    },
    additionalData: {
      courseName: data.courseName,
      courseDescription: data.courseDescription,
    },
  };

  return emailTriggerService.sendExternalEmail(request);
};

/**
 * Send a project enrollment email
 */
export const sendProjectEnrollmentEmail = async (data: {
  email: string;
  name: string;
  id: string;
  projectName: string;
  projectDescription?: string;
}) => {
  const request: ExternalEmailRequest = {
    emailType: 'PROJECT_ENROLLMENT',
    userData: {
      email: data.email,
      name: data.name,
      id: data.id,
    },
    additionalData: {
      projectName: data.projectName,
      projectDescription: data.projectDescription,
    },
  };

  return emailTriggerService.sendExternalEmail(request);
};

/**
 * Send an interview prep enrollment email
 */
export const sendInterviewPrepEnrollmentEmail = async (data: {
  email: string;
  name: string;
  id: string;
  sheetName: string;
  sheetDescription?: string;
}) => {
  const request: ExternalEmailRequest = {
    emailType: 'INTERVIEW_PREP_ENROLLMENT',
    userData: {
      email: data.email,
      name: data.name,
      id: data.id,
    },
    additionalData: {
      sheetName: data.sheetName,
      sheetDescription: data.sheetDescription,
    },
  };

  return emailTriggerService.sendExternalEmail(request);
};

/**
 * Send a course completion email
 */
export const sendCourseCompletionEmail = async (data: {
  email: string;
  name: string;
  id: string;
  courseName: string;
  courseUrl: string;
  completionDate: string;
  certificateUrl?: string;
}) => {
  const request: ExternalEmailRequest = {
    emailType: 'COURSE_COMPLETION',
    userData: {
      email: data.email,
      name: data.name,
      id: data.id,
    },
    additionalData: {
      courseName: data.courseName,
      courseUrl: data.courseUrl,
      completionDate: data.completionDate,
      certificateUrl: data.certificateUrl,
    },
  };

  return emailTriggerService.sendExternalEmail(request);
};

/**
 * Generic function to send any type of email
 */
export const sendEmail = async (request: ExternalEmailRequest) =>
  emailTriggerService.sendExternalEmail(request);
