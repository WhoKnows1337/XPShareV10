/**
 * Input Sanitization
 *
 * Validates and sanitizes user inputs to prevent injection attacks.
 */

/**
 * Sanitize text input
 * Removes potentially dangerous characters and limits length
 */
export function sanitizeText(input: string, maxLength: number = 10000): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string')
  }

  // Trim whitespace
  let sanitized = input.trim()

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  // Remove null bytes (potential for SQL injection)
  sanitized = sanitized.replace(/\0/g, '')

  // Remove invisible characters (except newlines, tabs, spaces)
  sanitized = sanitized.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '')

  return sanitized
}

/**
 * Validate and sanitize category input
 */
export function sanitizeCategory(category: string): string {
  const sanitized = sanitizeText(category, 100)

  // Only allow alphanumeric, hyphens, underscores, and spaces
  if (!/^[a-zA-Z0-9\s_-]+$/.test(sanitized)) {
    throw new Error('Invalid category format')
  }

  return sanitized
}

/**
 * Validate and sanitize array of categories
 */
export function sanitizeCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) {
    throw new Error('Categories must be an array')
  }

  if (categories.length > 50) {
    throw new Error('Too many categories (max 50)')
  }

  return categories.map((cat) => {
    if (typeof cat !== 'string') {
      throw new Error('Each category must be a string')
    }
    return sanitizeCategory(cat)
  })
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(
  input: unknown,
  min?: number,
  max?: number
): number {
  const num = Number(input)

  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Invalid number')
  }

  if (min !== undefined && num < min) {
    throw new Error(`Number must be >= ${min}`)
  }

  if (max !== undefined && num > max) {
    throw new Error(`Number must be <= ${max}`)
  }

  return num
}

/**
 * Validate and sanitize latitude
 */
export function sanitizeLatitude(lat: unknown): number {
  return sanitizeNumber(lat, -90, 90)
}

/**
 * Validate and sanitize longitude
 */
export function sanitizeLongitude(lng: unknown): number {
  return sanitizeNumber(lng, -180, 180)
}

/**
 * Validate and sanitize date string
 */
export function sanitizeDate(dateStr: unknown): Date {
  if (typeof dateStr !== 'string') {
    throw new Error('Date must be a string')
  }

  const sanitized = sanitizeText(dateStr, 50)
  const date = new Date(sanitized)

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format')
  }

  // Reasonable date range: 1900 to 2100
  if (date.getFullYear() < 1900 || date.getFullYear() > 2100) {
    throw new Error('Date out of valid range')
  }

  return date
}

/**
 * Validate and sanitize limit parameter
 */
export function sanitizeLimit(limit: unknown, defaultLimit: number = 100): number {
  if (limit === undefined || limit === null) {
    return defaultLimit
  }

  return sanitizeNumber(limit, 1, 1000)
}

/**
 * Validate and sanitize offset parameter
 */
export function sanitizeOffset(offset: unknown): number {
  if (offset === undefined || offset === null) {
    return 0
  }

  return sanitizeNumber(offset, 0, 100000)
}

/**
 * Sanitize message content for AI chat
 */
export function sanitizeMessage(message: unknown): string {
  if (typeof message !== 'string') {
    throw new Error('Message must be a string')
  }

  // Remove null bytes and dangerous characters
  let sanitized = sanitizeText(message, 50000)

  // Check for prompt injection attempts (basic detection)
  const suspiciousPatterns = [
    /ignore\s+(previous|above|all)\s+instructions/i,
    /system\s*:\s*/i,
    /you\s+are\s+(now|a|an)\s+(admin|root|developer)/i,
    /<\s*script/i,
    /javascript\s*:/i,
    /on(load|error|click)\s*=/i,
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      console.warn('[SECURITY] Potential prompt injection detected:', sanitized.substring(0, 100))
      // Don't throw - just log and continue (AI will handle it)
    }
  }

  return sanitized
}

/**
 * Sanitize messages array for AI SDK
 */
export interface SanitizedMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export function sanitizeMessages(messages: unknown): SanitizedMessage[] {
  if (!Array.isArray(messages)) {
    throw new Error('Messages must be an array')
  }

  if (messages.length === 0) {
    throw new Error('Messages array cannot be empty')
  }

  if (messages.length > 100) {
    throw new Error('Too many messages (max 100)')
  }

  return messages.map((msg, index) => {
    if (typeof msg !== 'object' || msg === null) {
      throw new Error(`Message at index ${index} must be an object`)
    }

    const { role, content } = msg as any

    if (!role || !['user', 'assistant', 'system'].includes(role)) {
      throw new Error(`Invalid role at index ${index}`)
    }

    if (typeof content !== 'string') {
      throw new Error(`Message content at index ${index} must be a string`)
    }

    return {
      role: role as 'user' | 'assistant' | 'system',
      content: sanitizeMessage(content),
    }
  })
}
