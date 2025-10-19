import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { locales } from './i18n'

// Create the next-intl middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed'
})

export async function middleware(request: NextRequest) {
  // First, handle internationalization - this adds locale to headers
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

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(de|en|fr|es)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|api|.*\\..*).*)'
  ],
}
