/**
 * Log Interceptor Module
 *
 * This module intercepts toast notifications and API responses to log them.
 * It's designed to be easily removable - just delete this file and remove
 * the LogProvider from App.tsx and the LogViewer from MainLayout.tsx
 */

// Store reference to log context
let logContext: {
  addLog: (log: {
    type: "toast" | "api_success" | "api_error";
    title: string;
    description?: string;
    data?: any;
    method?: string;
    path?: string;
    status?: number;
  }) => void;
} | null = null;

/**
 * Initialize the log interceptor with the log context
 * This should be called from the LogProvider component
 */
export const initLogInterceptor = (context: {
  addLog: (log: {
    type: "toast" | "api_success" | "api_error";
    title: string;
    description?: string;
    data?: any;
    method?: string;
    path?: string;
    status?: number;
  }) => void;
}) => {
  logContext = context;
};

/**
 * Log a toast notification
 */
export const logToast = (
  type: "success" | "error" | "info" | "warning",
  title: string,
  description?: string,
  data?: any,
) => {
  if (!logContext) return;

  logContext.addLog({
    type: "toast",
    title: `${type.toUpperCase()}: ${title}`,
    description,
    data,
  });
};

/**
 * Log an API success response
 */
export const logApiSuccess = (
  method: string,
  path: string,
  status: number,
  data?: any,
) => {
  if (!logContext) return;

  logContext.addLog({
    type: "api_success",
    title: `${method} ${path} → ${status}`,
    method,
    path,
    status,
    data,
  });
};

/**
 * Log an API error response
 */
export const logApiError = (
  method: string,
  path: string,
  status: number | string,
  message?: string,
  data?: any,
) => {
  if (!logContext) return;

  logContext.addLog({
    type: "api_error",
    title: `${method} ${path} → ${status}`,
    description: message,
    method,
    path,
    status: typeof status === "number" ? status : undefined,
    data,
  });
};
