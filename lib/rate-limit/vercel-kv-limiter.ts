import { kv } from '@vercel/kv';

/**
 * Rate Limit Configuration
 * Defines limits per endpoint for different user actions
 */
interface RateLimitConfig {
  limit: number; // Max requests
  window: number; // Time window in seconds
}

/**
 * Rate limit rules per endpoint
 * More restrictive for write operations, lenient for reads
 */
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Submit Flow - Critical endpoints
  '/api/submit/publish': { limit: 10, window: 3600 }, // 10 per hour
  '/api/submit/analyze': { limit: 30, window: 900 }, // 30 per 15min
  '/api/submit/upload': { limit: 50, window: 900 }, // 50 per 15min
  '/api/submit/enrich': { limit: 20, window: 900 }, // 20 per 15min

  // Search & Browse - Read-heavy
  '/api/search': { limit: 100, window: 60 }, // 100 per minute
  '/api/experiences': { limit: 200, window: 60 }, // 200 per minute
  '/api/patterns': { limit: 50, window: 60 }, // 50 per minute

  // User Actions - Moderate
  '/api/comments': { limit: 30, window: 300 }, // 30 per 5min
  '/api/likes': { limit: 100, window: 300 }, // 100 per 5min
  '/api/follow': { limit: 50, window: 300 }, // 50 per 5min

  // Admin - Very restrictive
  '/api/admin': { limit: 100, window: 3600 }, // 100 per hour

  // Default fallback
  default: { limit: 100, window: 60 }, // 100 per minute
};

/**
 * Rate Limit Result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number; // Unix timestamp
  limit: number;
}

/**
 * Check rate limit for an IP + endpoint combination
 * Uses Vercel KV (Redis) for persistent, distributed rate limiting
 *
 * @param ip - Client IP address
 * @param endpoint - API endpoint path
 * @returns Rate limit status
 */
export async function checkRateLimit(ip: string, endpoint: string): Promise<RateLimitResult> {
  // Find matching config (exact match or default)
  const config = Object.keys(RATE_LIMITS)
    .filter((key) => key !== 'default')
    .find((key) => endpoint.startsWith(key))
    ? RATE_LIMITS[Object.keys(RATE_LIMITS).find((key) => endpoint.startsWith(key))!]
    : RATE_LIMITS.default;

  const key = `ratelimit:${ip}:${endpoint}`;

  try {
    // Increment counter (atomic operation)
    const count = await kv.incr(key);

    // Set expiry on first request
    if (count === 1) {
      await kv.expire(key, config.window);
    }

    // Get TTL for reset time
    const ttl = (await kv.ttl(key)) || config.window;
    const resetTimestamp = Date.now() + ttl * 1000;

    return {
      allowed: count <= config.limit,
      remaining: Math.max(0, config.limit - count),
      reset: resetTimestamp,
      limit: config.limit,
    };
  } catch (error) {
    console.error('[Rate Limit] KV Error:', error);

    // Fail open - allow request if KV unavailable
    // Better to have service up than block legitimate users
    return {
      allowed: true,
      remaining: config.limit,
      reset: Date.now() + config.window * 1000,
      limit: config.limit,
    };
  }
}

/**
 * Get current rate limit status without incrementing
 * Useful for displaying rate limit info to users
 *
 * @param ip - Client IP address
 * @param endpoint - API endpoint path
 */
export async function getRateLimitStatus(ip: string, endpoint: string): Promise<RateLimitResult> {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
  const key = `ratelimit:${ip}:${endpoint}`;

  try {
    const count = (await kv.get<number>(key)) || 0;
    const ttl = (await kv.ttl(key)) || config.window;
    const resetTimestamp = Date.now() + ttl * 1000;

    return {
      allowed: count < config.limit,
      remaining: Math.max(0, config.limit - count),
      reset: resetTimestamp,
      limit: config.limit,
    };
  } catch (error) {
    console.error('[Rate Limit] Status check error:', error);
    return {
      allowed: true,
      remaining: config.limit,
      reset: Date.now() + config.window * 1000,
      limit: config.limit,
    };
  }
}

/**
 * Reset rate limit for an IP + endpoint (admin use)
 *
 * @param ip - Client IP address
 * @param endpoint - API endpoint path (optional, resets all if omitted)
 */
export async function resetRateLimit(ip: string, endpoint?: string): Promise<void> {
  try {
    if (endpoint) {
      // Reset specific endpoint
      const key = `ratelimit:${ip}:${endpoint}`;
      await kv.del(key);
    } else {
      // Reset all endpoints for this IP
      const pattern = `ratelimit:${ip}:*`;
      const keys = await kv.keys(pattern);
      if (keys.length > 0) {
        await kv.del(...keys);
      }
    }
  } catch (error) {
    console.error('[Rate Limit] Reset error:', error);
  }
}

/**
 * Get rate limit statistics (admin use)
 *
 * @returns Aggregated rate limit stats
 */
export async function getRateLimitStats(): Promise<{
  totalKeys: number;
  byEndpoint: Record<string, number>;
}> {
  try {
    const keys = await kv.keys('ratelimit:*');

    const byEndpoint: Record<string, number> = {};
    for (const key of keys) {
      const parts = key.split(':');
      if (parts.length >= 3) {
        const endpoint = parts.slice(2).join(':');
        byEndpoint[endpoint] = (byEndpoint[endpoint] || 0) + 1;
      }
    }

    return {
      totalKeys: keys.length,
      byEndpoint,
    };
  } catch (error) {
    console.error('[Rate Limit] Stats error:', error);
    return {
      totalKeys: 0,
      byEndpoint: {},
    };
  }
}
