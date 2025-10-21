/**
 * Rate Limiting for Discovery API
 *
 * Uses in-memory LRU cache for rate limiting.
 * For production with multiple servers, consider Redis.
 */

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory cache for rate limiting
const rateLimitCache = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitCache.entries()) {
    if (entry.resetAt < now) {
      rateLimitCache.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Rate limit configuration
 */
export const RATE_LIMITS = {
  // Discovery API: 50 requests per minute per user
  discovery: {
    limit: 50,
    window: 60 * 1000, // 1 minute in ms
  },
  // Anonymous users: 10 requests per minute per IP
  anonymous: {
    limit: 10,
    window: 60 * 1000,
  },
} as const

/**
 * Rate limit a request
 *
 * @param identifier - Unique identifier (user ID or IP address)
 * @param limit - Maximum number of requests
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const key = `ratelimit:${identifier}`

  // Get or create entry
  let entry = rateLimitCache.get(key)

  // Reset if window has passed
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    }
    rateLimitCache.set(key, entry)
  }

  // Increment count
  entry.count++

  // Check if limit exceeded
  const success = entry.count <= limit
  const remaining = Math.max(0, limit - entry.count)

  return {
    success,
    limit,
    remaining,
    reset: entry.resetAt,
  }
}

/**
 * Rate limit for Discovery API
 *
 * @param userId - User ID (authenticated) or IP address (anonymous)
 * @param isAuthenticated - Whether user is authenticated
 * @returns Rate limit result
 */
export function rateLimitDiscovery(
  userId: string,
  isAuthenticated: boolean
): RateLimitResult {
  const config = isAuthenticated ? RATE_LIMITS.discovery : RATE_LIMITS.anonymous
  return rateLimit(userId, config.limit, config.window)
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  }
}
