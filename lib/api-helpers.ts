import { NextResponse } from 'next/server'
import { handleError } from './errors'

/**
 * Success response helper
 */
export function successResponse<T>(data: T, statusCode: number = 200) {
  return NextResponse.json(data, { status: statusCode })
}

/**
 * Error response helper
 */
export function errorResponse(error: unknown) {
  const { error: message, code, statusCode, ...rest } = handleError(error)

  return NextResponse.json(
    {
      error: message,
      code,
      ...rest,
    },
    { status: statusCode }
  )
}

/**
 * Pagination helper
 */
export interface PaginationParams {
  page?: number
  limit?: number
}

export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)

  return { page, limit }
}

export function getPaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
  }
}

/**
 * CORS headers helper
 */
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

/**
 * Rate limiting helper (simple in-memory cache)
 */
const rateLimitCache = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(identifier: string, maxRequests: number = 60, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitCache.get(identifier)

  if (!record || now > record.resetAt) {
    rateLimitCache.set(identifier, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimitCache() {
  const now = Date.now()
  for (const [key, value] of rateLimitCache.entries()) {
    if (now > value.resetAt) {
      rateLimitCache.delete(key)
    }
  }
}
