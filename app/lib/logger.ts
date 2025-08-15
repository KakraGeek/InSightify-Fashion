// Comprehensive logging system for InSightify Fashion

interface LogContext {
  userId?: string
  workspaceId?: string
  operation?: string
  requestId?: string
  ip?: string
  userAgent?: string
  sessionId?: string
}

interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  context: LogContext
  data?: any
  error?: Error
}

// Log levels configuration
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

const CURRENT_LOG_LEVEL = process.env.LOG_LEVEL || 'info'

class Logger {
  private context: LogContext = {}

  /**
   * Set the base context for all subsequent log entries
   */
  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context }
  }

  /**
   * Create a child logger with additional context
   */
  withContext(additionalContext: Partial<LogContext>): Logger {
    const childLogger = new Logger()
    childLogger.setContext({ ...this.context, ...additionalContext })
    return childLogger
  }

  /**
   * Log an info message
   */
  info(message: string, data?: any): void {
    this.log('info', message, data)
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: any): void {
    this.log('warn', message, data)
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, data?: any): void {
    this.log('error', message, data, error)
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: any): void {
    this.log('debug', message, data)
  }

  /**
   * Log authentication events
   */
  auth(message: string, userId?: string, workspaceId?: string, data?: any): void {
    this.log('info', `[AUTH] ${message}`, data, undefined, {
      userId,
      workspaceId,
      operation: 'authentication'
    })
  }

  /**
   * Log database operations
   */
  db(operation: string, resource: string, userId?: string, workspaceId?: string, data?: any): void {
    this.log('info', `[DB] ${operation} ${resource}`, data, undefined, {
      userId,
      workspaceId,
      operation: `db:${operation}`
    })
  }

  /**
   * Log API requests
   */
  api(method: string, path: string, userId?: string, workspaceId?: string, data?: any): void {
    this.log('info', `[API] ${method} ${path}`, data, undefined, {
      userId,
      workspaceId,
      operation: `api:${method.toLowerCase()}`
    })
  }

  /**
   * Log business operations
   */
  business(operation: string, resource: string, userId?: string, workspaceId?: string, data?: any): void {
    this.log('info', `[BUSINESS] ${operation} ${resource}`, data, undefined, {
      userId,
      workspaceId,
      operation: `business:${operation}`
    })
  }

  /**
   * Log security events
   */
  security(event: string, userId?: string, workspaceId?: string, data?: any): void {
    this.log('warn', `[SECURITY] ${event}`, data, undefined, {
      userId,
      workspaceId,
      operation: 'security'
    })
  }

  /**
   * Log performance metrics
   */
  performance(operation: string, duration: number, userId?: string, workspaceId?: string, data?: any): void {
    this.log('info', `[PERFORMANCE] ${operation} took ${duration}ms`, data, undefined, {
      userId,
      workspaceId,
      operation: `performance:${operation}`
    })
  }

  /**
   * Internal logging method
   */
  private log(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    data?: any,
    error?: Error,
    additionalContext?: Partial<LogContext>
  ): void {
    // Check if we should log at this level
    if (LOG_LEVELS[level] < LOG_LEVELS[CURRENT_LOG_LEVEL as keyof typeof LOG_LEVELS]) {
      return
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...additionalContext },
      data,
      error
    }

    // Format the log entry
    const formattedLog = this.formatLogEntry(logEntry)
    
    // Output to console (in production, this would go to a log aggregation service)
    if (level === 'error') {
      console.error(formattedLog)
    } else if (level === 'warn') {
      console.warn(formattedLog)
    } else if (level === 'debug') {
      console.debug(formattedLog)
    } else {
      console.log(formattedLog)
    }

    // In production, you might want to send critical logs to external services
    if (level === 'error' && process.env.NODE_ENV === 'production') {
      this.sendToExternalService(logEntry)
    }
  }

  /**
   * Format log entry for output
   */
  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, context, data, error } = entry
    
    let formatted = `[${timestamp}] ${level.toUpperCase()}: ${message}`
    
    // Add context information
    if (context.userId) formatted += ` | User: ${context.userId}`
    if (context.workspaceId) formatted += ` | Workspace: ${context.workspaceId}`
    if (context.operation) formatted += ` | Operation: ${context.operation}`
    if (context.requestId) formatted += ` | Request: ${context.requestId}`
    if (context.ip) formatted += ` | IP: ${context.ip}`
    
    // Add data if present
    if (data) {
      formatted += ` | Data: ${JSON.stringify(data)}`
    }
    
    // Add error details if present
    if (error) {
      formatted += ` | Error: ${error.message}`
      if (error.stack) {
        formatted += ` | Stack: ${error.stack}`
      }
    }
    
    return formatted
  }

  /**
   * Send critical logs to external service (placeholder for production)
   */
  private sendToExternalService(logEntry: LogEntry): void {
    // In production, this would send to services like:
    // - Sentry for error tracking
    // - LogRocket for session replay
    // - DataDog for monitoring
    // - AWS CloudWatch for AWS deployments
    
    // For now, we'll just log to console
    console.log(`[EXTERNAL] Would send to external service:`, logEntry)
  }

  /**
   * Create a request logger with request-specific context
   */
  static forRequest(req: any): Logger {
    const logger = new Logger()
    
    const context: LogContext = {
      requestId: req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    }
    
    logger.setContext(context)
    return logger
  }

  /**
   * Create a user logger with user-specific context
   */
  static forUser(userId: string, workspaceId: string): Logger {
    const logger = new Logger()
    logger.setContext({ userId, workspaceId })
    return logger
  }

  /**
   * Create an operation logger
   */
  static forOperation(operation: string, userId?: string, workspaceId?: string): Logger {
    const logger = new Logger()
    logger.setContext({ operation, userId, workspaceId })
    return logger
  }
}

// Export the main logger instance and the class
export const logger = new Logger()
export default Logger

// Convenience functions for common logging scenarios
export const logAuth = (message: string, userId?: string, workspaceId?: string, data?: any) => {
  logger.auth(message, userId, workspaceId, data)
}

export const logDb = (operation: string, resource: string, userId?: string, workspaceId?: string, data?: any) => {
  logger.db(operation, resource, userId, workspaceId, data)
}

export const logApi = (method: string, path: string, userId?: string, workspaceId?: string, data?: any) => {
  logger.api(method, path, userId, workspaceId, data)
}

export const logBusiness = (operation: string, resource: string, userId?: string, workspaceId?: string, data?: any) => {
  logger.business(operation, resource, userId, workspaceId, data)
}

export const logSecurity = (event: string, userId?: string, workspaceId?: string, data?: any) => {
  logger.security(event, userId, workspaceId, data)
}

export const logPerformance = (operation: string, duration: number, userId?: string, workspaceId?: string, data?: any) => {
  logger.performance(operation, duration, userId, workspaceId, data)
}
