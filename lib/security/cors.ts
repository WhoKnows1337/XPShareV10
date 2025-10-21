/**
 * CORS Configuration
 *
 * Cross-Origin Resource Sharing configuration for API routes.
 */

export const ALLOWED_ORIGINS =
  process.env.NODE_ENV === 'production'
    ? [
        'https://xpshare.com',
        'https://www.xpshare.com',
        'https://xpshare.vercel.app',
        // Add your production domains here
      ]
    : [
        'http://localhost:3000',
        'http://localhost:3010',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3010',
      ]

/**
 * Get CORS headers for API responses
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
  }

  // Check if origin is allowed
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Credentials'] = 'true'
  } else if (process.env.NODE_ENV === 'development') {
    // Allow all origins in development
    headers['Access-Control-Allow-Origin'] = '*'
  }

  return headers
}

/**
 * Handle OPTIONS preflight request
 */
export function handleCorsPreflightRequest(request: Request): Response {
  const origin = request.headers.get('Origin')
  const headers = getCorsHeaders(origin)

  return new Response(null, {
    status: 204,
    headers,
  })
}

/**
 * Add CORS headers to existing response
 */
export function addCorsHeaders(response: Response, origin: string | null): Response {
  const corsHeaders = getCorsHeaders(origin)

  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}
