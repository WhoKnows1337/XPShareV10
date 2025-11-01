import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { locales } from './i18n'

// ============================================================
// RATE LIMITING CONFIGURATION
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

// In-memory store for rate limiting (replace with Redis/Vercel KV in production)
const rateLimitStore = new Map<string, {
  count: number;
  resetTime: number;
}>();

// Clean up old entries periodically
if (typeof setInterval !== 'undefined') {
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
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed'
})

export async function middleware(request: NextRequest) {
  const requestPathname = request.nextUrl.pathname

  // ============================================================
  // API ROUTE SECURITY & RATE LIMITING
  // ============================================================
  if (requestPathname.startsWith('/api/')) {
    // Apply security headers for API routes
    const apiResponse = NextResponse.next()

    // Security headers
    apiResponse.headers.set('X-Content-Type-Options', 'nosniff')
    apiResponse.headers.set('X-Frame-Options', 'DENY')
    apiResponse.headers.set('X-XSS-Protection', '1; mode=block')
    apiResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    apiResponse.headers.delete('X-Powered-By')

    // Rate limiting
    const clientIdentifier = getClientIdentifier(request)
    const rateLimitConfig = getRateLimitConfig(requestPathname)
    const rateLimitKey = `${clientIdentifier}:${requestPathname}`
    const now = Date.now()
    const rateLimit = rateLimitStore.get(rateLimitKey)

    if (rateLimit) {
      if (now < rateLimit.resetTime) {
        if (rateLimit.count >= rateLimitConfig.max) {
          // Rate limit exceeded
          const retryAfter = Math.ceil((rateLimit.resetTime - now) / 1000)

          return new NextResponse(
            JSON.stringify({
              error: 'Too many requests',
              retryAfter,
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': retryAfter.toString(),
                'X-RateLimit-Limit': rateLimitConfig.max.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
              },
            }
          )
        }
        rateLimit.count++
      } else {
        // Reset window
        rateLimitStore.set(rateLimitKey, {
          count: 1,
          resetTime: now + rateLimitConfig.windowMs,
        })
      }
    } else {
      // First request
      rateLimitStore.set(rateLimitKey, {
        count: 1,
        resetTime: now + rateLimitConfig.windowMs,
      })
    }

    // Add rate limit headers
    const currentLimit = rateLimitStore.get(rateLimitKey)!
    apiResponse.headers.set('X-RateLimit-Limit', rateLimitConfig.max.toString())
    apiResponse.headers.set(
      'X-RateLimit-Remaining',
      Math.max(0, rateLimitConfig.max - currentLimit.count).toString()
    )
    apiResponse.headers.set(
      'X-RateLimit-Reset',
      new Date(currentLimit.resetTime).toISOString()
    )

    // Check for suspicious patterns in API requests
    const suspiciousPatterns = [
      /(\.\.|\/\/)/,  // Path traversal
      /<script/i,      // Script injection
      /javascript:/i,  // JavaScript protocol
      /on\w+\s*=/i,    // Event handlers
    ]

    if (suspiciousPatterns.some(pattern => pattern.test(request.url))) {
      console.warn('Suspicious API request detected:', {
        url: request.url,
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
    // Note: api is not excluded as it needs middleware processing
    '/((?!_next|_vercel|.*\\..*).*)'
  ],
}
