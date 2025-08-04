import { envConfig } from '@/constant';
import type { 
  EmailTriggerType, 
  EmailTriggerData, 
  CourseEnrollmentEmailData, 
  ProjectEnrollmentEmailData, 
  InterviewPrepEnrollmentEmailData,
  EmailRequest,
  EmailResponse 
} from '@/interfaces/email';
import { emailClient } from './client';
import { 
  welcomeEmailTemplate, 
  courseEnrollmentTemplate, 
  projectEnrollmentTemplate, 
  interviewPrepEnrollmentTemplate 
} from './templates';

class EmailTriggerService {
  private getEmailTemplate(
    trigger: EmailTriggerType, 
    data: EmailTriggerData | CourseEnrollmentEmailData | ProjectEnrollmentEmailData | InterviewPrepEnrollmentEmailData
  ): { subject: string; htmlContent: string } {
    switch (trigger) {
      case 'WELCOME':
        return {
          subject: '🎉 Welcome to The Boring Education - Let\'s Build Something Amazing!',
          htmlContent: welcomeEmailTemplate(data as EmailTriggerData),
        };
      
      case 'COURSE_ENROLLMENT':
        const courseData = data as CourseEnrollmentEmailData;
        return {
          subject: `🚀 You're enrolled in ${courseData.courseName} - Let's start learning!`,
          htmlContent: courseEnrollmentTemplate(courseData),
        };
      
      case 'PROJECT_ENROLLMENT':
        const projectData = data as ProjectEnrollmentEmailData;
        return {
          subject: `🛠️ Time to build ${projectData.projectName} - Your coding journey starts now!`,
          htmlContent: projectEnrollmentTemplate(projectData),
        };
      
      case 'INTERVIEW_PREP_ENROLLMENT':
        const interviewData = data as InterviewPrepEnrollmentEmailData;
        return {
          subject: `💼 Ready to ace ${interviewData.sheetName}? Let's prep for success!`,
          htmlContent: interviewPrepEnrollmentTemplate(interviewData),
        };
      
      default:
        throw new Error(`Unknown email trigger: ${trigger}`);
    }
  }

  async sendTriggerEmail(
    trigger: EmailTriggerType,
    data: EmailTriggerData | CourseEnrollmentEmailData | ProjectEnrollmentEmailData | InterviewPrepEnrollmentEmailData
  ): Promise<EmailResponse> {
    try {
      const { subject, htmlContent } = this.getEmailTemplate(trigger, data);
      
      const emailRequest: EmailRequest = {
        from_email: envConfig.FROM_EMAIL,
        to_email: data.userEmail,
        subject,
        html_content: htmlContent,
      };

      const result = await emailClient.sendEmail(emailRequest);
      
      // Log for monitoring
      console.log(`Email trigger ${trigger} sent to ${data.userEmail}:`, result.success ? 'SUCCESS' : 'FAILED');
      
      return result;
    } catch (error: any) {
      console.error(`Email trigger ${trigger} failed for ${data.userEmail}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to send trigger email',
      };
    }
  }

  async sendWelcomeEmail(data: EmailTriggerData): Promise<EmailResponse> {
    return this.sendTriggerEmail('WELCOME', data);
  }

  async sendCourseEnrollmentEmail(data: CourseEnrollmentEmailData): Promise<EmailResponse> {
    return this.sendTriggerEmail('COURSE_ENROLLMENT', data);
  }

  async sendProjectEnrollmentEmail(data: ProjectEnrollmentEmailData): Promise<EmailResponse> {
    return this.sendTriggerEmail('PROJECT_ENROLLMENT', data);
  }

  async sendInterviewPrepEnrollmentEmail(data: InterviewPrepEnrollmentEmailData): Promise<EmailResponse> {
    return this.sendTriggerEmail('INTERVIEW_PREP_ENROLLMENT', data);
  }
}

export const emailTriggerService = new EmailTriggerService();