// Error logging utility for frontend
export interface ErrorLog {
  timestamp: string;
  error: string;
  context?: string;
  userId?: string;
  stack?: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  log(error: Error | string, context?: string, userId?: string): void {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      error: typeof error === 'string' ? error : error.message,
      context,
      userId,
      stack: typeof error === 'string' ? undefined : error.stack,
    };

    this.logs.push(errorLog);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorLogger:', errorLog);
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  getRecentErrors(count: number = 10): ErrorLog[] {
    return this.logs.slice(-count);
  }
}

export const errorLogger = new ErrorLogger();
