import { emailLogger } from "@tbe/constants";
import axios from "axios";

import { getChitthiConfig } from "./config";
import type { EmailRequest, EmailResponse } from "./interfaces";

/**
 * Chitthi email dispatcher client.
 *
 * All third-party email provider integration lives here. The rest of the
 * codebase talks to this client through the `emailTriggerService` and never
 * hits Chitthi directly, so provider details stay in one place.
 */
class ChitthiClient {
  private get config() {
    return getChitthiConfig();
  }

  async sendEmail(
    emailData: EmailRequest,
    requestId?: string,
  ): Promise<EmailResponse> {
    const currentRequestId = requestId || emailLogger.generateRequestId();
    const startTime = Date.now();
    const { url, apiKey } = this.config;

    try {
      if (!apiKey) {
        const error = new Error("Chitthi API key not configured");
        emailLogger.logError(
          currentRequestId,
          emailData.to_email,
          error,
          "CONFIGURATION",
        );
        throw error;
      }

      if (!url) {
        const error = new Error("Chitthi service URL not configured");
        emailLogger.logError(
          currentRequestId,
          emailData.to_email,
          error,
          "CONFIGURATION",
        );
        throw error;
      }

      emailLogger.logApiCall(currentRequestId, emailData.to_email, {
        apiUrl: url,
        subject: emailData.subject,
        hasApiKey: !!apiKey,
      });

      const baseUrl = url.replace(/\/+$/, "");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Chitthi-API-Key": apiKey,
      };
      headers["Authorization"] = "Bearer " + apiKey;

      const response = await axios.post(`${baseUrl}/send-email`, emailData, {
        headers,
        timeout: 10000,
      });

      const duration = Date.now() - startTime;

      emailLogger.logSuccess(currentRequestId, emailData.to_email, duration, {
        httpStatus: response.status,
        responseData: response.data,
        subject: emailData.subject,
      });

      return {
        success: true,
        message: "Email sent successfully",
        requestId: currentRequestId,
      };
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const err = error as {
        response?: { status?: number; statusText?: string; data?: unknown };
        message?: string;
        code?: string;
      };

      emailLogger.logError(
        currentRequestId,
        emailData.to_email,
        error,
        "API_CALL",
        {
          duration,
          httpStatus: err.response?.status,
          httpStatusText: err.response?.statusText,
          responseData: err.response?.data,
          subject: emailData.subject,
          apiUrl: url,
          isTimeout: err.code === "ECONNABORTED",
          isNetworkError: !err.response,
        },
      );

      return {
        success: false,
        error:
          (err.response?.data as { message?: string } | undefined)?.message ||
          err.message ||
          "Failed to send email",
        requestId: currentRequestId,
      };
    }
  }

  async sendBulkEmails(emails: EmailRequest[]): Promise<EmailResponse[]> {
    const results = await Promise.allSettled(
      emails.map((email) => this.sendEmail(email)),
    );

    return results.map((result) =>
      result.status === "fulfilled"
        ? result.value
        : { success: false, error: "Failed to send email" },
    );
  }
}

export const emailClient = new ChitthiClient();
