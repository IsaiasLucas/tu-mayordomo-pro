/**
 * Silent error tracking utility
 * Logs errors without disrupting user experience
 */

type ErrorLevel = 'error' | 'warn' | 'info';

interface ErrorLog {
  level: ErrorLevel;
  message: string;
  context?: string;
  timestamp: string;
  stack?: string;
}

class ErrorTracker {
  private logs: ErrorLog[] = [];
  private maxLogs = 100; // Keep last 100 errors in memory

  log(level: ErrorLevel, message: string, error?: Error, context?: string) {
    // Only log to console in development
    if (process.env.NODE_ENV === 'development') {
      const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
      logFn(`[${context || 'App'}]`, message, error || '');
    }

    // Store in memory for debugging
    const log: ErrorLog = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      stack: error?.stack,
    };

    this.logs.push(log);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // In production, you could send to a logging service here
    // e.g., Sentry, LogRocket, etc.
  }

  error(message: string, error?: Error, context?: string) {
    this.log('error', message, error, context);
  }

  warn(message: string, context?: string) {
    this.log('warn', message, undefined, context);
  }

  info(message: string, context?: string) {
    this.log('info', message, undefined, context);
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const errorTracker = new ErrorTracker();

// Global unhandled promise rejection handler
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.error(
      'Unhandled promise rejection',
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      'Global'
    );
    
    // Prevent default browser behavior (console error)
    event.preventDefault();
  });

  // Global error handler
  window.addEventListener('error', (event) => {
    errorTracker.error(
      event.message,
      event.error,
      'Global'
    );
    
    // Prevent default browser behavior
    event.preventDefault();
  });
}
