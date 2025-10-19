/**
 * In-Memory Rate Limiter for Search 5.0
 *
 * Simple sliding window rate limiter without external dependencies.
 * For production with Redis, migrate to @upstash/ratelimit.
 *
 * @see docs/masterdocs/search5.md (Part 3.11 - Cost Control)
 */

interface RateLimitRecord {
  count: number
  windowStart: number
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * In-memory sliding window rate limiter
 */
export class InMemoryRateLimiter {
  private records: Map<string, RateLimitRecord> = new Map()
  private limit: number
  private windowMs: number
  private cleanupInterval: NodeJS.Timeout

  constructor(limit: number, windowMs: number) {
    this.limit = limit
    this.windowMs = windowMs

    // Cleanup expired records every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  /**
   * Check if identifier is within rate limit
   */
  async check(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const record = this.records.get(identifier)

    // No existing record - first request
    if (!record) {
      this.records.set(identifier, {
        count: 1,
        windowStart: now
      })

      return {
        success: true,
        limit: this.limit,
        remaining: this.limit - 1,
        reset: now + this.windowMs
      }
    }

    // Window expired - reset
    if (now - record.windowStart >= this.windowMs) {
      this.records.set(identifier, {
        count: 1,
        windowStart: now
      })

      return {
        success: true,
        limit: this.limit,
        remaining: this.limit - 1,
        reset: now + this.windowMs
      }
    }

    // Within window - check limit
    if (record.count >= this.limit) {
      return {
        success: false,
        limit: this.limit,
        remaining: 0,
        reset: record.windowStart + this.windowMs
      }
    }

    // Increment count
    record.count++
    this.records.set(identifier, record)

    return {
      success: true,
      limit: this.limit,
      remaining: this.limit - record.count,
      reset: record.windowStart + this.windowMs
    }
  }

  /**
   * Clean up expired records
   */
  private cleanup() {
    const now = Date.now()
    const toDelete: string[] = []

    for (const [key, record] of this.records.entries()) {
      if (now - record.windowStart >= this.windowMs) {
        toDelete.push(key)
      }
    }

    toDelete.forEach(key => this.records.delete(key))

    console.log(`🧹 Rate limiter cleanup: removed ${toDelete.length} expired records`)
  }

  /**
   * Get current stats (for monitoring)
   */
  getStats() {
    return {
      totalRecords: this.records.size,
      limit: this.limit,
      windowMs: this.windowMs
    }
  }

  /**
   * Destroy limiter (cleanup interval)
   */
  destroy() {
    clearInterval(this.cleanupInterval)
    this.records.clear()
  }
}

/**
 * Global rate limiters for different endpoints
 */

// Pattern Discovery: 20 requests per minute
export const patternDiscoveryLimiter = new InMemoryRateLimiter(20, 60000)

// General Search: 60 requests per minute
export const searchLimiter = new InMemoryRateLimiter(60, 60000)

// Autocomplete: 100 requests per minute (more lenient)
export const autocompleteLimiter = new InMemoryRateLimiter(100, 60000)

/**
 * Get identifier from request (user ID or IP)
 */
export function getIdentifier(headers: Headers, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }

  // Fallback to IP address
  const forwarded = headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'anonymous'
  return `ip:${ip}`
}

/**
 * Calculate estimated tokens for cost tracking
 * Rough estimate: 1 token ≈ 4 characters
 */
export function calculateEstimatedTokens(messages: any[]): number {
  const totalChars = messages.reduce((sum, msg) => {
    const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content || '')
    return sum + content.length
  }, 0)

  return Math.ceil(totalChars / 4)
}
