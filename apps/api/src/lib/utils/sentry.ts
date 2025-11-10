import * as Sentry from '@sentry/nextjs';

/**
 * Capture an exception with additional context
 */
export const captureException = (
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    user?: Record<string, any>;
    level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  }
) =>
  Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
    user: context?.user,
    level: context?.level || 'error',
  });

/**
 * Capture a message with additional context
 */
export const captureMessage = (
  message: string,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  }
) =>
  Sentry.captureMessage(message, {
    tags: context?.tags,
    extra: context?.extra,
    level: context?.level || 'info',
  });

/**
 * Add user context to Sentry
 */
export const setUser = (user: {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: any;
}) => {
  Sentry.setUser(user);
};

/**
 * Add tags to all subsequent events
 */
export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

/**
 * Add extra context to all subsequent events
 */
export const setContext = (key: string, context: Record<string, any>) => {
  Sentry.setContext(key, context);
};

/**
 * Track API errors specifically
 */
export const captureAPIError = (
  error: Error,
  endpoint: string,
  method: string,
  statusCode?: number,
  requestData?: any
) =>
  Sentry.captureException(error, {
    tags: {
      section: 'api',
      endpoint,
      method,
      status_code: statusCode?.toString() || 'unknown',
    },
    extra: {
      endpoint,
      method,
      statusCode,
      requestData,
    },
    level: 'error',
  });

/**
 * Track database errors specifically
 */
export const captureDatabaseError = (
  error: Error,
  operation: string,
  collection?: string,
  query?: any
) =>
  Sentry.captureException(error, {
    tags: {
      section: 'database',
      operation,
      collection: collection || 'unknown',
    },
    extra: {
      operation,
      collection,
      query,
    },
    level: 'error',
  });

/**
 * Track authentication errors specifically
 */
export const captureAuthError = (
  error: Error,
  authMethod: string,
  userId?: string
) =>
  Sentry.captureException(error, {
    tags: {
      section: 'authentication',
      auth_method: authMethod,
    },
    extra: {
      authMethod,
      userId,
    },
    level: 'warning',
  });

/**
 * Track payment errors specifically
 */
export const capturePaymentError = (
  error: Error,
  paymentMethod: string,
  amount?: number,
  userId?: string
) =>
  Sentry.captureException(error, {
    tags: {
      section: 'payment',
      payment_method: paymentMethod,
    },
    extra: {
      paymentMethod,
      amount,
      userId,
    },
    level: 'error',
  });

/**
 * Track performance issues
 */
export const trackPerformance = (name: string, value: number, unit = 'ms') => {
  Sentry.addBreadcrumb({
    message: `Performance: ${name}`,
    level: 'info',
    data: {
      value,
      unit,
    },
  });
};

/**
 * Add breadcrumb for tracking user actions
 */
export const addBreadcrumb = (
  message: string,
  category: string,
  data?: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
  });
};

/**
 * Start a new span for performance monitoring
 */
export const startSpan = (name: string, op: string, callback: () => any) =>
  Sentry.startSpan(
    {
      name,
      op,
    },
    callback
  );

export default {
  captureException,
  captureMessage,
  setUser,
  setTag,
  setContext,
  captureAPIError,
  captureDatabaseError,
  captureAuthError,
  capturePaymentError,
  trackPerformance,
  addBreadcrumb,
  startSpan,
};
