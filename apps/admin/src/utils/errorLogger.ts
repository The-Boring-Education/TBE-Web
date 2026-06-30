import { toast } from "@/components/ui/use-toast";

export interface ErrorDetails {
  message: string;
  status?: number;
  statusText?: string;
  url?: string;
  method?: string;
  timestamp: string;
  environment?: string;
  userAgent?: string;
  stack?: string;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private errorCount = 0;
  private readonly MAX_ERRORS = 10;

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private formatError(error: any, context?: string): ErrorDetails {
    const details: ErrorDetails = {
      message: this.extractErrorMessage(error),
      timestamp: new Date().toISOString(),
      environment:
        typeof window !== "undefined"
          ? localStorage.getItem("tbe-admin-api-env") || "unknown"
          : "server",
      userAgent:
        typeof window !== "undefined" ? navigator.userAgent : "unknown",
    };

    // Extract HTTP error details
    if (error?.response) {
      details.status = error.response.status;
      details.statusText = error.response.statusText;
      details.url = error.response.config?.url;
      details.method = error.response.config?.method?.toUpperCase();
    } else if (error?.request) {
      details.url = error.request.url;
      details.method = error.request.method;
    }

    // Extract stack trace for debugging
    if (error?.stack) {
      details.stack = error.stack;
    }

    return details;
  }

  private extractErrorMessage(error: any): string {
    if (typeof error === "string") return error;

    // Try to get the most meaningful error message
    const apiDetail = error?.response?.data?.detail;
    const apiMessage = error?.response?.data?.message;
    const axiosMessage = error?.message;
    const genericMessage = error?.toString?.() || "Unknown error occurred";

    return apiDetail || apiMessage || axiosMessage || genericMessage;
  }

  private shouldShowToast(error: ErrorDetails): boolean {
    // Don't show toast for network errors (likely offline)
    if (error.status === 0 || error.message.includes("Network Error")) {
      return false;
    }

    // Don't show toast for 401/403 (auth errors handled elsewhere)
    if (error.status === 401 || error.status === 403) {
      return false;
    }

    return true;
  }

  logError(
    error: any,
    context?: string,
    showToast: boolean = true,
  ): ErrorDetails {
    const errorDetails = this.formatError(error, context);

    // Log to console with enhanced details
    console.group(
      `🚨 Error ${++this.errorCount} - ${context || "Unknown Context"}`,
    );
    console.error("Error Details:", errorDetails);
    console.error("Original Error:", error);
    console.groupEnd();

    // Store error in localStorage for debugging (limit to prevent overflow)
    this.storeError(errorDetails);

    // Show toast if requested and appropriate
    if (showToast && this.shouldShowToast(errorDetails)) {
      toast({
        title: `Error: ${context || "Operation Failed"}`,
        description: errorDetails.message,
        variant: "destructive",
        duration: 8000, // Show longer for errors
      });
    }

    return errorDetails;
  }

  private storeError(errorDetails: ErrorDetails): void {
    try {
      const storedErrors = JSON.parse(
        localStorage.getItem("tbe-error-log") || "[]",
      );
      storedErrors.unshift(errorDetails);

      // Keep only the last MAX_ERRORS errors
      if (storedErrors.length > this.MAX_ERRORS) {
        storedErrors.splice(this.MAX_ERRORS);
      }

      localStorage.setItem("tbe-error-log", JSON.stringify(storedErrors));
    } catch (e) {
      console.warn("Failed to store error in localStorage:", e);
    }
  }

  getStoredErrors(): ErrorDetails[] {
    try {
      return JSON.parse(localStorage.getItem("tbe-error-log") || "[]");
    } catch {
      return [];
    }
  }

  clearStoredErrors(): void {
    localStorage.removeItem("tbe-error-log");
    this.errorCount = 0;
  }

  // Utility method for common error patterns
  logApiError(
    error: any,
    operation: string,
    showToast: boolean = true,
  ): ErrorDetails {
    return this.logError(error, `API ${operation}`, showToast);
  }

  logNetworkError(error: any, operation: string): ErrorDetails {
    return this.logError(error, `Network ${operation}`, false); // Don't show toast for network errors
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Convenience functions
export const logError = (error: any, context?: string, showToast?: boolean) =>
  errorLogger.logError(error, context, showToast);

export const logApiError = (
  error: any,
  operation: string,
  showToast?: boolean,
) => errorLogger.logApiError(error, operation, showToast);

export const logNetworkError = (error: any, operation: string) =>
  errorLogger.logNetworkError(error, operation);
