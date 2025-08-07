import { v4 as uuidv4 } from 'uuid';

export interface EmailLogData {
  requestId: string;
  trigger?: string;
  userEmail: string;
  userId?: string;
  timestamp: string;
  stage: 'REQUEST' | 'TEMPLATE_GENERATION' | 'API_CALL' | 'SUCCESS' | 'ERROR';
  duration?: number;
  error?: any;
  metadata?: Record<string, any>;
}

export interface EmailMetrics {
  totalRequests: number;
  successCount: number;
  failureCount: number;
  averageDuration: number;
  errorsByType: Record<string, number>;
}

class EmailLogger {
  private metrics: EmailMetrics = {
    totalRequests: 0,
    successCount: 0,
    failureCount: 0,
    averageDuration: 0,
    errorsByType: {},
  };

  private durations: number[] = [];

  generateRequestId(): string {
    return uuidv4();
  }

  private updateMetrics(logData: EmailLogData) {
    if (logData.stage === 'REQUEST') {
      this.metrics.totalRequests++;
    } else if (logData.stage === 'SUCCESS') {
      this.metrics.successCount++;
      if (logData.duration) {
        this.durations.push(logData.duration);
        this.metrics.averageDuration =
          this.durations.reduce((a, b) => a + b, 0) / this.durations.length;
      }
    } else if (logData.stage === 'ERROR') {
      this.metrics.failureCount++;
      if (logData.error?.message) {
        const errorType = logData.error.message.split(':')[0] || 'Unknown';
        this.metrics.errorsByType[errorType] =
          (this.metrics.errorsByType[errorType] || 0) + 1;
      }
    }
  }

  log(
    data: Partial<EmailLogData> & {
      requestId: string;
      stage: EmailLogData['stage'];
      userEmail: string;
    }
  ) {
    const logData: EmailLogData = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    this.updateMetrics(logData);

    // Structured logging with different levels
    const logMessage = {
      service: 'email',
      ...logData,
    };

    switch (logData.stage) {
      case 'REQUEST':
        console.log('📧 [EMAIL-REQUEST]', JSON.stringify(logMessage, null, 2));
        break;
      case 'TEMPLATE_GENERATION':
        console.log('🎨 [EMAIL-TEMPLATE]', JSON.stringify(logMessage, null, 2));
        break;
      case 'API_CALL':
        console.log('🌐 [EMAIL-API]', JSON.stringify(logMessage, null, 2));
        break;
      case 'SUCCESS':
        console.log('✅ [EMAIL-SUCCESS]', JSON.stringify(logMessage, null, 2));
        break;
      case 'ERROR':
        console.error('❌ [EMAIL-ERROR]', JSON.stringify(logMessage, null, 2));
        break;
    }
  }

  logRequest(
    requestId: string,
    trigger: string,
    userEmail: string,
    userId?: string,
    metadata?: Record<string, any>
  ) {
    this.log({
      requestId,
      trigger,
      userEmail,
      userId,
      stage: 'REQUEST',
      metadata,
    });
  }

  logTemplateGeneration(
    requestId: string,
    userEmail: string,
    metadata?: Record<string, any>
  ) {
    this.log({
      requestId,
      userEmail,
      stage: 'TEMPLATE_GENERATION',
      metadata,
    });
  }

  logApiCall(
    requestId: string,
    userEmail: string,
    metadata?: Record<string, any>
  ) {
    this.log({
      requestId,
      userEmail,
      stage: 'API_CALL',
      metadata,
    });
  }

  logSuccess(
    requestId: string,
    userEmail: string,
    duration: number,
    metadata?: Record<string, any>
  ) {
    this.log({
      requestId,
      userEmail,
      stage: 'SUCCESS',
      duration,
      metadata,
    });
  }

  logError(
    requestId: string,
    userEmail: string,
    error: any,
    stage?: string,
    metadata?: Record<string, any>
  ) {
    this.log({
      requestId,
      userEmail,
      stage: 'ERROR',
      error: {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        code: error?.code,
        response: error?.response?.data,
        stage: stage || 'unknown',
      },
      metadata,
    });
  }

  getMetrics(): EmailMetrics {
    return { ...this.metrics };
  }

  printMetricsSummary() {
    const successRate =
      this.metrics.totalRequests > 0
        ? (
            (this.metrics.successCount / this.metrics.totalRequests) *
            100
          ).toFixed(2)
        : '0';

    console.log('\n📊 [EMAIL-METRICS] Summary:');
    console.log({
      totalRequests: this.metrics.totalRequests,
      successRate: `${successRate}%`,
      failureCount: this.metrics.failureCount,
      averageDuration: `${this.metrics.averageDuration.toFixed(2)}ms`,
      errorsByType: this.metrics.errorsByType,
    });
  }
}

export const emailLogger = new EmailLogger();
