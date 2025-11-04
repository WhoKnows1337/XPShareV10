/**
 * Simple In-Memory Rate Limiter
 *
 * NOTE: This is a basic implementation for single-instance deployments.
 * For production with multiple instances, use Redis-based rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup old entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if a key (IP/user ID) has exceeded the rate limit
   */
  check(key: string, config: RateLimitConfig): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
  } {
    const now = Date.now();
    const entry = this.storage.get(key);

    // No entry or expired - create new
    if (!entry || entry.resetAt < now) {
      const resetAt = now + config.windowMs;
      this.storage.set(key, {
        count: 1,
        resetAt,
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt,
      };
    }

    // Entry exists and is valid
    if (entry.count >= config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
      };
    }

    // Increment count
    entry.count++;
    this.storage.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.storage.delete(key);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.storage.entries()) {
      if (entry.resetAt < now) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.storage.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`[RateLimiter] Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Destroy rate limiter (clear interval)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.storage.clear();
  }

  /**
   * Get current stats
   */
  getStats(): { totalEntries: number } {
    return {
      totalEntries: this.storage.size,
    };
  }
}

// Singleton instance
let rateLimiterInstance: RateLimiter | null = null;

/**
 * Get the singleton rate limiter instance
 */
export function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter();
  }
  return rateLimiterInstance;
}

/**
 * Pre-configured rate limit configs
 */
export const RATE_LIMIT_CONFIGS = {
  // Link parsing: 10 requests per minute
  LINK_PARSE: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },

  // File upload: 50 requests per minute (generous for dev/testing)
  FILE_UPLOAD: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minute
  },

  // API calls: 30 requests per minute
  API: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },
};

/**
 * Extract IP address from Next.js request
 */
export function getClientIP(request: Request): string {
  // Try various headers (for reverse proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to a generic identifier
  return 'unknown';
}

/**
 * Middleware helper for Next.js Route Handlers
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
} {
  const limiter = getRateLimiter();
  const result = limiter.check(identifier, config);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    return {
      ...result,
      retryAfter,
    };
  }

  return result;
}

/**
 * Create a rate limit error response
 */
export function rateLimitError(resetAt: number, retryAfter: number) {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again in ${retryAfter} seconds.`,
      retryAfter,
      resetAt: new Date(resetAt).toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': resetAt.toString(),
      },
    }
  );
}
