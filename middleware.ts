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

  // Protected routes that require authentication (with locale prefix)
  const protectedRoutes = ['/feed', '/profile', '/settings', '/submit', '/map', '/timeline', '/experiences', '/admin', '/categories']
  // Public routes that should NOT require authentication
  const publicRoutes: string[] = []
  const pathname = request.nextUrl.pathname

  // Remove locale prefix to check route
  const pathnameWithoutLocale = pathname.replace(/^\/(de|en|fr|es)/, '') || '/'

  // Check if route is explicitly public first
  const isPublicRoute = publicRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  )

  const isProtectedRoute = !isPublicRoute && protectedRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  )

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
