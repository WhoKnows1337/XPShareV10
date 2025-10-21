/**
 * Error Types & Structured Error Handling
 *
 * Defines structured error types with recovery actions for better UX.
 */

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'
export type ErrorCategory =
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'rate_limit'
  | 'timeout'
  | 'server'
  | 'unknown'

export interface RecoveryAction {
  label: string
  action: 'retry' | 'refresh' | 'login' | 'contact_support' | 'custom'
  handler?: () => void | Promise<void>
}

export interface StructuredError {
  code: string
  category: ErrorCategory
  severity: ErrorSeverity
  message: string
  userMessage: string
  technicalDetails?: string
  recoveryActions: RecoveryAction[]
  timestamp: number
  context?: Record<string, any>
}

/**
 * Discovery-specific error codes
 */
export const ERROR_CODES = {
  // Network errors
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',

  // Authentication errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  AUTH_INVALID: 'AUTH_INVALID',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE: 'UNSUPPORTED_FILE_TYPE',

  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  TOOL_EXECUTION_FAILED: 'TOOL_EXECUTION_FAILED',

  // AI-specific errors
  AI_TIMEOUT: 'AI_TIMEOUT',
  AI_ERROR: 'AI_ERROR',
  CONTEXT_LENGTH_EXCEEDED: 'CONTEXT_LENGTH_EXCEEDED',

  // Storage errors
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

/**
 * Create structured error from raw error
 */
export function createStructuredError(
  error: unknown,
  context?: Record<string, any>
): StructuredError {
  const timestamp = Date.now()

  // Handle known error codes
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      if (message.includes('timeout')) {
        return {
          code: ERROR_CODES.NETWORK_TIMEOUT,
          category: 'timeout',
          severity: 'warning',
          message: 'Request timeout',
          userMessage: 'The request took too long. Please try again with a simpler query.',
          technicalDetails: error.message,
          recoveryActions: [
            { label: 'Retry', action: 'retry' },
            { label: 'Refresh Page', action: 'refresh' },
          ],
          timestamp,
          context,
        }
      }

      return {
        code: ERROR_CODES.NETWORK_ERROR,
        category: 'network',
        severity: 'error',
        message: 'Network error',
        userMessage: 'Connection failed. Please check your internet and try again.',
        technicalDetails: error.message,
        recoveryActions: [
          { label: 'Retry', action: 'retry' },
          { label: 'Refresh Page', action: 'refresh' },
        ],
        timestamp,
        context,
      }
    }

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return {
        code: ERROR_CODES.AUTH_REQUIRED,
        category: 'authentication',
        severity: 'error',
        message: 'Authentication required',
        userMessage: 'Please sign in to use the discovery feature.',
        technicalDetails: error.message,
        recoveryActions: [
          { label: 'Sign In', action: 'login' },
          { label: 'Refresh Page', action: 'refresh' },
        ],
        timestamp,
        context,
      }
    }

    // Rate limiting
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return {
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        category: 'rate_limit',
        severity: 'warning',
        message: 'Rate limit exceeded',
        userMessage: 'Too many requests. Please wait a moment before trying again.',
        technicalDetails: error.message,
        recoveryActions: [
          { label: 'Wait 1 minute', action: 'custom' },
        ],
        timestamp,
        context,
      }
    }

    // Context length
    if (message.includes('context') && message.includes('length')) {
      return {
        code: ERROR_CODES.CONTEXT_LENGTH_EXCEEDED,
        category: 'validation',
        severity: 'warning',
        message: 'Message too long',
        userMessage: 'Your message is too long. Try breaking it into smaller parts.',
        technicalDetails: error.message,
        recoveryActions: [
          { label: 'Clear History', action: 'custom' },
        ],
        timestamp,
        context,
      }
    }

    // File errors
    if (message.includes('file') && message.includes('large')) {
      return {
        code: ERROR_CODES.FILE_TOO_LARGE,
        category: 'validation',
        severity: 'warning',
        message: 'File too large',
        userMessage: 'File exceeds 10MB limit. Please use a smaller file.',
        technicalDetails: error.message,
        recoveryActions: [],
        timestamp,
        context,
      }
    }
  }

  // Generic server error
  return {
    code: ERROR_CODES.SERVER_ERROR,
    category: 'server',
    severity: 'error',
    message: 'Server error',
    userMessage: 'An unexpected error occurred. Please try again.',
    technicalDetails: error instanceof Error ? error.message : String(error),
    recoveryActions: [
      { label: 'Retry', action: 'retry' },
      { label: 'Contact Support', action: 'contact_support' },
    ],
    timestamp,
    context,
  }
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: StructuredError): boolean {
  return error.recoveryActions.length > 0 && error.severity !== 'critical'
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: StructuredError): string {
  return error.userMessage || error.message
}

/**
 * Log error with context
 */
export function logError(error: StructuredError): void {
  const logLevel = error.severity === 'critical' || error.severity === 'error' ? 'error' : 'warn'

  console[logLevel]('[Error]', {
    code: error.code,
    category: error.category,
    severity: error.severity,
    message: error.message,
    technicalDetails: error.technicalDetails,
    timestamp: new Date(error.timestamp).toISOString(),
    context: error.context,
  })
}
