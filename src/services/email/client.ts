import axios from 'axios';
import { envConfig } from '@/constant';
import type { EmailRequest, EmailResponse } from '@/interfaces/email';

class EmailClient {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = envConfig.EMAIL_SERVICE_URL;
    this.apiKey = envConfig.EMAIL_API_KEY;
  }

  async sendEmail(emailData: EmailRequest): Promise<EmailResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Email API key not configured');
      }

      const response = await axios.post(
        `${this.apiUrl}/send-email`,
        emailData,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Breevo-API-Key': this.apiKey,
          },
          timeout: 10000, // 10 second timeout
        }
      );

      return {
        success: true,
        message: 'Email sent successfully',
      };
    } catch (error: any) {
      console.error('Email sending failed:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to send email',
      };
    }
  }

  async sendBulkEmails(emails: EmailRequest[]): Promise<EmailResponse[]> {
    const results = await Promise.allSettled(
      emails.map(email => this.sendEmail(email))
    );

    return results.map(result => 
      result.status === 'fulfilled' 
        ? result.value 
        : { success: false, error: 'Failed to send email' }
    );
  }
}

export const emailClient = new EmailClient();