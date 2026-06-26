export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

class Logger {
  private log(level: LogLevel, message: string, data?: unknown) {
    const timestamp = new Date().toISOString()
    // In a production environment, this could push to Datadog, Sentry, etc.
    if (process.env.NODE_ENV !== 'production' || level === 'error') {
      const consoleMethod = level === 'debug' ? 'log' : level
      if (data) {
        console[consoleMethod](`[${timestamp}] [${level.toUpperCase()}] ${message}`, data)
      } else {
        console[consoleMethod](`[${timestamp}] [${level.toUpperCase()}] ${message}`)
      }
    }
  }

  info(message: string, data?: unknown) {
    this.log('info', message, data)
  }

  warn(message: string, data?: unknown) {
    this.log('warn', message, data)
  }

  error(message: string, error?: unknown, data?: unknown) {
    const errorDetails = error instanceof Error 
      ? { name: error.name, message: error.message, stack: error.stack }
      : { error }
      
    // Combine data and errorDetails if both are provided
    const combinedData = typeof data === 'object' && data !== null 
      ? { ...data, ...errorDetails }
      : { data, ...errorDetails }
      
    this.log('error', message, combinedData)
  }

  debug(message: string, data?: unknown) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, data)
    }
  }
}

export const logger = new Logger()
