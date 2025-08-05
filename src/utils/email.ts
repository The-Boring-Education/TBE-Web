import type {
  EmailTriggerData,
  CourseEnrollmentEmailData,
  ProjectEnrollmentEmailData,
  InterviewPrepEnrollmentEmailData,
} from '@/interfaces/email';
import { emailTriggerService } from '@/services/email';

/**
 * Utility function to send welcome email to new users
 * Now includes enhanced logging and request tracking
 */
export const sendWelcomeEmail = async (userData: {
  email: string;
  name: string;
  userId: string;
}) => {
  const emailData: EmailTriggerData = {
    userEmail: userData.email,
    userName: userData.name,
    userId: userData.userId,
  };

  try {
    const result = await emailTriggerService.sendWelcomeEmail(emailData);

    // Enhanced logging for better tracking
    if (result.success) {
      console.log(
        `✅ Welcome email queued successfully for ${userData.email} (RequestID: ${result.requestId})`
      );
    } else {
      console.error(
        `❌ Welcome email failed for ${userData.email} (RequestID: ${result.requestId}):`,
        result.error
      );
    }

    return result;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: 'Failed to send welcome email' };
  }
};

/**
 * Utility function to send course enrollment email
 * Now includes enhanced logging and request tracking
 */
export const sendCourseEnrollmentEmail = async (enrollmentData: {
  userEmail: string;
  userName: string;
  userId: string;
  courseName: string;
  courseDescription?: string;
  courseId: string;
}) => {
  const emailData: CourseEnrollmentEmailData = {
    userEmail: enrollmentData.userEmail,
    userName: enrollmentData.userName,
    userId: enrollmentData.userId,
    courseName: enrollmentData.courseName,
    courseDescription: enrollmentData.courseDescription,
    courseUrl: `https://www.theboringeducation.com/shiksha/${enrollmentData.courseId}`,
  };

  try {
    const result = await emailTriggerService.sendCourseEnrollmentEmail(
      emailData
    );

    // Enhanced logging for better tracking
    if (result.success) {
      console.log(
        `✅ Course enrollment email queued successfully for ${enrollmentData.userEmail} - ${enrollmentData.courseName} (RequestID: ${result.requestId})`
      );
    } else {
      console.error(
        `❌ Course enrollment email failed for ${enrollmentData.userEmail} - ${enrollmentData.courseName} (RequestID: ${result.requestId}):`,
        result.error
      );
    }

    return result;
  } catch (error) {
    console.error('Failed to send course enrollment email:', error);
    return { success: false, error: 'Failed to send course enrollment email' };
  }
};

/**
 * Utility function to send project enrollment email
 * Now includes enhanced logging and request tracking
 */
export const sendProjectEnrollmentEmail = async (enrollmentData: {
  userEmail: string;
  userName: string;
  userId: string;
  projectName: string;
  projectDescription?: string;
  projectId: string;
}) => {
  const emailData: ProjectEnrollmentEmailData = {
    userEmail: enrollmentData.userEmail,
    userName: enrollmentData.userName,
    userId: enrollmentData.userId,
    projectName: enrollmentData.projectName,
    projectDescription: enrollmentData.projectDescription,
    projectUrl: `https://www.theboringeducation.com/projects/${enrollmentData.projectId}`,
  };

  try {
    const result = await emailTriggerService.sendProjectEnrollmentEmail(
      emailData
    );

    // Enhanced logging for better tracking
    if (result.success) {
      console.log(
        `✅ Project enrollment email queued successfully for ${enrollmentData.userEmail} - ${enrollmentData.projectName} (RequestID: ${result.requestId})`
      );
    } else {
      console.error(
        `❌ Project enrollment email failed for ${enrollmentData.userEmail} - ${enrollmentData.projectName} (RequestID: ${result.requestId}):`,
        result.error
      );
    }

    return result;
  } catch (error) {
    console.error('Failed to send project enrollment email:', error);
    return { success: false, error: 'Failed to send project enrollment email' };
  }
};

/**
 * Utility function to send interview prep enrollment email
 * Now includes enhanced logging and request tracking
 */
export const sendInterviewPrepEnrollmentEmail = async (enrollmentData: {
  userEmail: string;
  userName: string;
  userId: string;
  sheetName: string;
  sheetDescription?: string;
  sheetId: string;
}) => {
  const emailData: InterviewPrepEnrollmentEmailData = {
    userEmail: enrollmentData.userEmail,
    userName: enrollmentData.userName,
    userId: enrollmentData.userId,
    sheetName: enrollmentData.sheetName,
    sheetDescription: enrollmentData.sheetDescription,
    sheetUrl: `https://www.theboringeducation.com/interview-prep/${enrollmentData.sheetId}`,
  };

  try {
    const result = await emailTriggerService.sendInterviewPrepEnrollmentEmail(
      emailData
    );

    // Enhanced logging for better tracking
    if (result.success) {
      console.log(
        `✅ Interview prep enrollment email queued successfully for ${enrollmentData.userEmail} - ${enrollmentData.sheetName} (RequestID: ${result.requestId})`
      );
    } else {
      console.error(
        `❌ Interview prep enrollment email failed for ${enrollmentData.userEmail} - ${enrollmentData.sheetName} (RequestID: ${result.requestId}):`,
        result.error
      );
    }

    return result;
  } catch (error) {
    console.error('Failed to send interview prep enrollment email:', error);
    return {
      success: false,
      error: 'Failed to send interview prep enrollment email',
    };
  }
};
