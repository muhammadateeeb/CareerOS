import { analytics } from '@/lib/analytics';

// ==================== TYPES ====================

export interface ErrorContext {
  userId?: string;
  action?: string;
  component?: string;
  service?: string;
  additionalData?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolvedAt?: string;
  resolution?: string;
}

// ==================== ERROR SERVICE ====================

export class ErrorService {
  private static errors: ErrorReport[] = [];
  private static maxErrors = 100; // Keep last 100 errors in memory

  // ==================== ERROR HANDLING ====================

  static handleError(
    error: Error | string,
    context: ErrorContext = {},
    severity: ErrorReport['severity'] = 'medium'
  ): string {
    const errorId = this.generateErrorId();
    const errorReport: ErrorReport = {
      id: errorId,
      timestamp: new Date().toISOString(),
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      context,
      severity,
      resolved: false,
    };

    // Store error
    this.errors.unshift(errorReport);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console
    this.logError(errorReport);

    // Track analytics
    this.trackError(errorReport);

    // Send to error tracking service (Sentry if available)
    this.sendToSentry(error, context, severity);

    return errorId;
  }

  static handleAsyncError(
    error: Error | string,
    context: ErrorContext = {},
    severity: ErrorReport['severity'] = 'medium'
  ): string {
    return this.handleError(error, context, severity);
  }

  static handleNetworkError(
    error: Error | string,
    url: string,
    method: string = 'GET',
    context: ErrorContext = {}
  ): string {
    return this.handleError(
      error,
      {
        ...context,
        service: 'network',
        action: `${method} ${url}`,
        additionalData: { url, method, ...context.additionalData },
      },
      'high'
    );
  }

  static handleValidationError(
    field: string,
    value: any,
    rule: string,
    context: ErrorContext = {}
  ): string {
    return this.handleError(
      `Validation failed for field "${field}": ${rule}`,
      {
        ...context,
        service: 'validation',
        action: 'field_validation',
        additionalData: { field, value, rule, ...context.additionalData },
      },
      'low'
    );
  }

  // ==================== ERROR RESOLUTION ====================

  static resolveError(
    errorId: string,
    resolution: string
  ): boolean {
    const error = this.errors.find(e => e.id === errorId);
    if (!error) return false;

    error.resolved = true;
    error.resolvedAt = new Date().toISOString();
    error.resolution = resolution;

    // Track resolution
    analytics.track('error_resolved', {
      errorId,
      resolution,
      timeToResolve: new Date(error.resolvedAt).getTime() - new Date(error.timestamp).getTime(),
    });

    return true;
  }

  // ==================== ERROR RETRIEVAL ====================

  static getErrors(
    filters: {
      severity?: ErrorReport['severity'];
      resolved?: boolean;
      service?: string;
      limit?: number;
    } = {}
  ): ErrorReport[] {
    let filteredErrors = [...this.errors];

    if (filters.severity) {
      filteredErrors = filteredErrors.filter(e => e.severity === filters.severity);
    }

    if (filters.resolved !== undefined) {
      filteredErrors = filteredErrors.filter(e => e.resolved === filters.resolved);
    }

    if (filters.service) {
      filteredErrors = filteredErrors.filter(e => e.context.service === filters.service);
    }

    if (filters.limit) {
      filteredErrors = filteredErrors.slice(0, filters.limit);
    }

    return filteredErrors;
  }

  static getError(errorId: string): ErrorReport | undefined {
    return this.errors.find(e => e.id === errorId);
  }

  static getErrorStats(): {
    total: number;
    resolved: number;
    bySeverity: Record<ErrorReport['severity'], number>;
    byService: Record<string, number>;
  } {
    const total = this.errors.length;
    const resolved = this.errors.filter(e => e.resolved).length;

    const bySeverity = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorReport['severity'], number>);

    const byService = this.errors.reduce((acc, error) => {
      const service = error.context.service || 'unknown';
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      resolved,
      bySeverity,
      byService,
    };
  }

  // ==================== ERROR LOGGING ====================

  private static logError(errorReport: ErrorReport): void {
    const logLevel = this.getLogLevel(errorReport.severity);
    const logMessage = `[${errorReport.id}] ${errorReport.message}`;
    
    switch (logLevel) {
      case 'error':
        console.error(logMessage, errorReport);
        break;
      case 'warn':
        console.warn(logMessage, errorReport);
        break;
      case 'info':
        console.info(logMessage, errorReport);
        break;
      default:
        console.log(logMessage, errorReport);
    }
  }

  private static getLogLevel(severity: ErrorReport['severity']): 'error' | 'warn' | 'info' | 'log' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      case 'low':
        return 'info';
      default:
        return 'log';
    }
  }

  // ==================== ANALYTICS TRACKING ====================

  private static trackError(errorReport: ErrorReport): void {
    analytics.track('error_occurred', {
      errorId: errorReport.id,
      message: errorReport.message,
      severity: errorReport.severity,
      service: errorReport.context.service,
      action: errorReport.context.action,
      component: errorReport.context.component,
      userId: errorReport.context.userId,
    });
  }

  // ==================== SENTRY INTEGRATION ====================

  private static sendToSentry(
    error: Error | string,
    context: ErrorContext,
    severity: ErrorReport['severity']
  ): void {
    // Only send to Sentry for high and critical errors
    if (severity !== 'high' && severity !== 'critical') return;

    try {
      // Check if Sentry is available
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        const Sentry = (window as any).Sentry;
        
        const sentryContext = {
          service: context.service,
          action: context.action,
          component: context.component,
          userId: context.userId,
          ...context.additionalData,
        };

        if (typeof error === 'string') {
          Sentry.captureMessage(error, {
            level: severity === 'critical' ? 'fatal' : 'error',
            tags: sentryContext,
          });
        } else {
          Sentry.captureException(error, {
            level: severity === 'critical' ? 'fatal' : 'error',
            tags: sentryContext,
            extra: context.additionalData,
          });
        }
      }
    } catch (sentryError) {
      console.warn('Failed to send error to Sentry:', sentryError);
    }
  }

  // ==================== UTILITY FUNCTIONS ====================

  private static generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== ERROR BOUNDARY HELPERS ====================

  static createErrorBoundaryHandler(
    componentName: string,
    userId?: string
  ): (error: Error, errorInfo: any) => void {
    return (error: Error, errorInfo: any) => {
      this.handleError(
        error,
        {
          userId,
          component: componentName,
          action: 'react_error_boundary',
          additionalData: {
            errorInfo,
            componentStack: errorInfo.componentStack,
          },
        },
        'high'
      );
    };
  }

  static createAsyncErrorHandler(
    serviceName: string,
    action: string,
    userId?: string
  ): (error: Error | string) => string {
    return (error: Error | string) => {
      return this.handleAsyncError(
        error,
        {
          userId,
          service: serviceName,
          action,
        },
        'medium'
      );
    };
  }

  // ==================== ERROR CLEARING ====================

  static clearErrors(): void {
    this.errors = [];
  }

  static clearResolvedErrors(): void {
    this.errors = this.errors.filter(e => !e.resolved);
  }

  // ==================== ERROR EXPORT ====================

  static exportErrors(): string {
    const exportData = {
      exportedAt: new Date().toISOString(),
      stats: this.getErrorStats(),
      errors: this.errors,
    };

    return JSON.stringify(exportData, null, 2);
  }

  // ==================== HEALTH CHECK ====================

  static getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    totalErrors: number;
    criticalErrors: number;
    recentErrors: number;
    lastError?: string;
  } {
    const stats = this.getErrorStats();
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const recentErrors = this.errors.filter(
      e => new Date(e.timestamp).getTime() > oneHourAgo
    ).length;

    const criticalErrors = stats.bySeverity.critical || 0;
    const totalErrors = stats.total;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (criticalErrors > 0 || recentErrors > 10) {
      status = 'critical';
    } else if (totalErrors > 50 || recentErrors > 5) {
      status = 'warning';
    }

    return {
      status,
      totalErrors,
      criticalErrors,
      recentErrors,
      lastError: this.errors[0]?.timestamp,
    };
  }
}

// ==================== ERROR HOOKS ====================

export const useErrorHandler = (userId?: string) => {
  const handleError = (
    error: Error | string,
    context: Omit<ErrorContext, 'userId'> = {},
    severity: ErrorReport['severity'] = 'medium'
  ): string => {
    return ErrorService.handleError(error, { ...context, userId }, severity);
  };

  const handleNetworkError = (
    error: Error | string,
    url: string,
    method: string = 'GET',
    context: Omit<ErrorContext, 'userId'> = {}
  ): string => {
    return ErrorService.handleNetworkError(error, url, method, { ...context, userId });
  };

  const handleValidationError = (
    field: string,
    value: any,
    rule: string,
    context: Omit<ErrorContext, 'userId'> = {}
  ): string => {
    return ErrorService.handleValidationError(field, value, rule, { ...context, userId });
  };

  return {
    handleError,
    handleNetworkError,
    handleValidationError,
    getErrors: ErrorService.getErrors,
    getErrorStats: ErrorService.getErrorStats,
    getHealthStatus: ErrorService.getHealthStatus,
  };
};

// ==================== ERROR WRAPPER ====================

export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: ErrorContext,
  onError?: (error: Error | string) => void
): ((...args: T) => Promise<R | null>) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorId = ErrorService.handleError(
        error instanceof Error ? error : new Error(String(error)),
        context
      );
      
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
      
      return null;
    }
  };
};
