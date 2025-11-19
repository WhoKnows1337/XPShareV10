import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { locales } from './i18n'
import { checkRateLimit } from '@/lib/rate-limit/vercel-kv-limiter'

// ============================================================
// FEATURE FLAGS
// ============================================================
const USE_VERCEL_KV = process.env.KV_REST_API_URL !== undefined

// ============================================================
// RATE LIMITING CONFIGURATION (FALLBACK FOR IN-MEMORY)
// ============================================================
const RATE_LIMITS = {
  // Submit endpoints - stricter limits
  '/api/submit/publish': { windowMs: 60 * 60 * 1000, max: 10 }, // 10 per hour
  '/api/submit/analyze': { windowMs: 15 * 60 * 1000, max: 30 }, // 30 per 15 min
  '/api/submit/analyze-complete': { windowMs: 15 * 60 * 1000, max: 20 },
  '/api/submit/enrich-text': { windowMs: 15 * 60 * 1000, max: 20 },
  '/api/submit/upload': { windowMs: 15 * 60 * 1000, max: 50 },

  // General API endpoints
  '/api/experiences': { windowMs: 1 * 60 * 1000, max: 60 }, // 60 per minute
  '/api/profile': { windowMs: 1 * 60 * 1000, max: 30 },
  '/api/search': { windowMs: 1 * 60 * 1000, max: 30 },

  // Default for all other API routes
  default: { windowMs: 1 * 60 * 1000, max: 100 },
};

// In-memory store for rate limiting (FALLBACK only - used when KV unavailable)
const rateLimitStore = new Map<string, {
  count: number;
  resetTime: number;
}>();

// Clean up old entries periodically (in-memory only)
if (typeof setInterval !== 'undefined' && !USE_VERCEL_KV) {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 60 * 1000); // Clean up every minute
}

// Create the next-intl middleware
// ⚠️ Using 'always' to ensure all locales have prefix (including EN)
// This ensures consistency with route structure /[locale]/...
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'
})

export async function middleware(request: NextRequest) {
  const requestPathname = request.nextUrl.pathname

  // ============================================================
  // API ROUTE SECURITY & RATE LIMITING
  // ============================================================
  // Check for /api/ OR /locale/api/ patterns
  const localeApiMatch = requestPathname.match(/^\/(de|en|fr|es)(\/api\/.+)/);

  if (localeApiMatch) {
    // REDIRECT: /de/api/... → /api/...
    // API routes should NEVER have locale prefixes
    const url = request.nextUrl.clone();
    url.pathname = localeApiMatch[2]; // e.g., "/api/media/confirm"
    return NextResponse.redirect(url, { status: 307 }); // Temporary redirect
  }

  if (requestPathname.startsWith('/api/')) {
    // Apply security headers for API routes
    const apiResponse = NextResponse.next()

    // Security headers
    apiResponse.headers.set('X-Content-Type-Options', 'nosniff')
    apiResponse.headers.set('X-Frame-Options', 'DENY')
    apiResponse.headers.set('X-XSS-Protection', '1; mode=block')
    apiResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    apiResponse.headers.delete('X-Powered-By')

    // Rate limiting - USE VERCEL KV IF AVAILABLE
    const clientIP = getClientIP(request)

    let rateLimitResult: {
      allowed: boolean;
      remaining: number;
      reset: number;
      limit: number;
    }

    if (USE_VERCEL_KV) {
      // ✅ PRODUCTION: Use Vercel KV (persistent, distributed)
      try {
        rateLimitResult = await checkRateLimit(clientIP, requestPathname)
      } catch (error) {
        console.error('[Middleware] KV rate limit error, falling back to in-memory:', error)
        // Fallback to in-memory if KV fails
        rateLimitResult = await checkRateLimitInMemory(
          getClientIdentifier(request),
          requestPathname
        )
      }
    } else {
      // ⚠️ FALLBACK: Use in-memory store (not production-ready)
      rateLimitResult = await checkRateLimitInMemory(
        getClientIdentifier(request),
        requestPathname
      )
    }

    // Check if rate limit exceeded
    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)

      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter,
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
          },
        }
      )
    }

    // Add rate limit headers to successful responses
    apiResponse.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    apiResponse.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    apiResponse.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.reset).toISOString())

    // Check for suspicious patterns in API requests (check pathname only, not full URL)
    const suspiciousPatterns = [
      /\.\./,          // Path traversal (parent directory)
      /<script/i,      // Script injection
      /javascript:/i,  // JavaScript protocol
      /on\w+\s*=/i,    // Event handlers
    ]

    // Check only the pathname and query string, not the full URL
    const pathAndQuery = requestPathname + request.nextUrl.search

    if (suspiciousPatterns.some(pattern => pattern.test(pathAndQuery))) {
      console.warn('Suspicious API request detected:', {
        pathname: requestPathname,
        query: request.nextUrl.search,
        ip: getClientIP(request),
        timestamp: new Date().toISOString(),
      })

      return new NextResponse(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return apiResponse
  }

  // For non-API routes, continue with intl middleware
  let response = intlMiddleware(request)

  // Create Supabase client with the response from intl middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error: any) {
    // Handle rate limit errors gracefully
    if (error?.message?.includes('rate limit')) {
      console.warn('Auth rate limit reached, allowing request through')
    } else {
      console.error('Auth error in middleware:', error)
    }
  }

  const pathname = request.nextUrl.pathname
  // Remove locale prefix to check route
  const pathnameWithoutLocale = pathname.replace(/^\/(de|en|fr|es)/, '') || '/'

  // UUID to Username redirect for profile pages - BEFORE auth check!
  // Pattern: /profile/[uuid] → /profile/[username]
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const profileMatch = pathnameWithoutLocale.match(/^\/profile\/([^\/]+)/)

  if (profileMatch && uuidRegex.test(profileMatch[1])) {
    const uuid = profileMatch[1]

    try {
      // Lookup username by UUID
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('id', uuid)
        .single()

      if (!error && data?.username) {
        // Redirect to username-based URL with 301 Permanent Redirect
        const url = request.nextUrl.clone()
        const locale = pathname.match(/^\/(de|en|fr|es)/)?.[1] || ''
        url.pathname = locale
          ? `/${locale}/profile/${data.username}`
          : `/profile/${data.username}`

        return NextResponse.redirect(url, { status: 301 })
      }
    } catch (error) {
      console.error('Error looking up username for UUID redirect:', error)
      // Continue to allow the request through if lookup fails
    }
  }

  // Protected routes that require authentication (with locale prefix)
  // Note: /profile/[username] is PUBLIC, but /profile/[username]/edit is PROTECTED
  const protectedRoutes = ['/feed', '/settings', '/submit', '/map', '/timeline', '/admin', '/categories']
  const protectedProfileRoutes = ['/edit'] // Sub-routes of /profile that are protected

  const isProtectedProfileRoute = pathnameWithoutLocale.match(/^\/profile\/[^\/]+\/(.+)/)
    ? protectedProfileRoutes.some(route => pathnameWithoutLocale.includes(route))
    : false

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  ) || isProtectedProfileRoute

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    const locale = pathname.match(/^\/(de|en|fr|es)/)?.[1] || 'en'
    url.pathname = `/${locale}/login`
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect to feed if accessing auth pages while logged in
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  )

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    const locale = pathname.match(/^\/(de|en|fr|es)/)?.[1] || 'en'
    url.pathname = `/${locale}/feed`
    return NextResponse.redirect(url)
  }

  return response
}

// ============================================================
// HELPER FUNCTIONS FOR RATE LIMITING
// ============================================================

/**
 * In-memory rate limiting (FALLBACK ONLY)
 * Used when Vercel KV is not available
 */
async function checkRateLimitInMemory(
  clientIdentifier: string,
  pathname: string
): Promise<{
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
}> {
  const rateLimitConfig = getRateLimitConfig(pathname)
  const rateLimitKey = `${clientIdentifier}:${pathname}`
  const now = Date.now()
  const rateLimit = rateLimitStore.get(rateLimitKey)

  if (rateLimit) {
    if (now < rateLimit.resetTime) {
      if (rateLimit.count >= rateLimitConfig.max) {
        // Rate limit exceeded
        return {
          allowed: false,
          remaining: 0,
          reset: rateLimit.resetTime,
          limit: rateLimitConfig.max,
        }
      }
      rateLimit.count++
      return {
        allowed: true,
        remaining: Math.max(0, rateLimitConfig.max - rateLimit.count),
        reset: rateLimit.resetTime,
        limit: rateLimitConfig.max,
      }
    } else {
      // Reset window
      rateLimitStore.set(rateLimitKey, {
        count: 1,
        resetTime: now + rateLimitConfig.windowMs,
      })
      return {
        allowed: true,
        remaining: rateLimitConfig.max - 1,
        reset: now + rateLimitConfig.windowMs,
        limit: rateLimitConfig.max,
      }
    }
  } else {
    // First request
    rateLimitStore.set(rateLimitKey, {
      count: 1,
      resetTime: now + rateLimitConfig.windowMs,
    })
    return {
      allowed: true,
      remaining: rateLimitConfig.max - 1,
      reset: now + rateLimitConfig.windowMs,
      limit: rateLimitConfig.max,
    }
  }
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return `${ip}-${hashString(userAgent)}`
}

/**
 * Get client IP address from various headers
 */
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) return realIP

  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) return cfConnectingIP

  return 'unknown-ip'
}

/**
 * Get rate limit configuration for endpoint
 */
function getRateLimitConfig(pathname: string): {
  windowMs: number;
  max: number;
} {
  // Check for exact match
  for (const [path, config] of Object.entries(RATE_LIMITS)) {
    if (path === 'default') continue
    if (pathname === path || pathname.startsWith(path)) {
      return config as { windowMs: number; max: number }
    }
  }
  return RATE_LIMITS.default
}

/**
 * Simple string hashing
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // API routes for rate limiting and security
    '/api/:path*',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(de|en|fr|es)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    // IMPORTANT: Exclude /api routes from locale matching to prevent /de/api/... URLs
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ],
}
