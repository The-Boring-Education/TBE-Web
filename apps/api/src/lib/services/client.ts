import axios from 'axios';

import { envConfig } from '@/lib/constants';
import type { EmailRequest, EmailResponse } from '@/lib/interfaces';
import { emailLogger } from '@/lib/constants';

class EmailClient {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = envConfig.EMAIL_SERVICE_URL;
    this.apiKey = envConfig.EMAIL_API_KEY;
  }

  async sendEmail(
    emailData: EmailRequest,
    requestId?: string
  ): Promise<EmailResponse> {
    const currentRequestId = requestId || emailLogger.generateRequestId();
    const startTime = Date.now();

    try {
      // Validate configuration
      if (!this.apiKey) {
        const error = new Error('Email API key not configured');
        emailLogger.logError(
          currentRequestId,
          emailData.to_email,
          error,
          'CONFIGURATION'
        );
        throw error;
      }

      if (!this.apiUrl) {
        const error = new Error('Email service URL not configured');
        emailLogger.logError(
          currentRequestId,
          emailData.to_email,
          error,
          'CONFIGURATION'
        );
        throw error;
      }

      // Log API call
      emailLogger.logApiCall(currentRequestId, emailData.to_email, {
        apiUrl: this.apiUrl,
        subject: emailData.subject,
        hasApiKey: !!this.apiKey,
      });

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

      const duration = Date.now() - startTime;

      // Log success with response details
      emailLogger.logSuccess(currentRequestId, emailData.to_email, duration, {
        httpStatus: response.status,
        responseData: response.data,
        subject: emailData.subject,
      });

      return {
        success: true,
        message: 'Email sent successfully',
        requestId: currentRequestId,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Enhanced error logging
      emailLogger.logError(
        currentRequestId,
        emailData.to_email,
        error,
        'API_CALL',
        {
          duration,
          httpStatus: error.response?.status,
          httpStatusText: error.response?.statusText,
          responseData: error.response?.data,
          subject: emailData.subject,
          apiUrl: this.apiUrl,
          isTimeout: error.code === 'ECONNABORTED',
          isNetworkError: !error.response,
        }
      );

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to send email',
        requestId: currentRequestId,
      };
    }
  }

  async sendBulkEmails(emails: EmailRequest[]): Promise<EmailResponse[]> {
    const results = await Promise.allSettled(
      emails.map((email) => this.sendEmail(email))
    );

    return results.map((result) =>
      result.status === 'fulfilled'
        ? result.value
        : { success: false, error: 'Failed to send email' }
    );
  }
}

export const emailClient = new EmailClient();
