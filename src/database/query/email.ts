import type { DatabaseQueryResponseType } from '@/interfaces';
import { emailClient } from '@/services/email';

interface EmailRequest {
  from_email?: string;
  from_name?: string;
  to_email: string;
  to_name?: string;
  subject: string;
  html_content: string;
}

/**
 * Send email using email client
 */
const sendEmailFromDB = async (
  emailData: EmailRequest
): Promise<DatabaseQueryResponseType> => {
  try {
    const formattedEmailData: EmailRequest = {
      from_email: emailData.from_email || 'theboringeducation@gmail.com',
      from_name: emailData.from_name || 'TBE',
      to_email: emailData.to_email,
      to_name: emailData.to_name,
      subject: emailData.subject,
      html_content: emailData.html_content,
    };

    const result = await emailClient.sendEmail(formattedEmailData);

    if (result.success) {
      return { data: result };
    } else {
      return { error: result.error || 'Failed to send email' };
    }
  } catch (error) {
    return { error: 'Email service error' };
  }
};

export {
  sendEmailFromDB,
};