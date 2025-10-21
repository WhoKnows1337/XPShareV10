/**
 * Query Performance Logger
 *
 * Tracks and logs query performance metrics for monitoring.
 * Helps identify slow queries and optimization opportunities.
 */

export interface QueryMetrics {
  query: string
  duration: number
  success: boolean
  error?: string
  userId?: string
  timestamp: number
}

/**
 * In-memory query metrics buffer
 * In production, send to monitoring service (Vercel Analytics, Sentry, etc.)
 */
const queryMetricsBuffer: QueryMetrics[] = []
const MAX_BUFFER_SIZE = 1000

/**
 * Log query performance metrics
 */
export function logQueryPerformance(metrics: Omit<QueryMetrics, 'timestamp'>) {
  const entry: QueryMetrics = {
    ...metrics,
    timestamp: Date.now(),
  }

  // Add to buffer
  queryMetricsBuffer.push(entry)

  // Trim buffer if too large
  if (queryMetricsBuffer.length > MAX_BUFFER_SIZE) {
    queryMetricsBuffer.shift()
  }

  // Log slow queries (> 2 seconds)
  if (metrics.duration > 2000) {
    console.warn('[SLOW QUERY]', {
      query: metrics.query,
      duration: `${metrics.duration}ms`,
      userId: metrics.userId,
      error: metrics.error,
    })
  }

  // Log errors
  if (!metrics.success) {
    console.error('[QUERY ERROR]', {
      query: metrics.query,
      duration: `${metrics.duration}ms`,
      userId: metrics.userId,
      error: metrics.error,
    })
  }
}

/**
 * Get query metrics summary
 */
export function getQueryMetrics(): {
  total: number
  successful: number
  failed: number
  avgDuration: number
  slowQueries: number
} {
  if (queryMetricsBuffer.length === 0) {
    return {
      total: 0,
      successful: 0,
      failed: 0,
      avgDuration: 0,
      slowQueries: 0,
    }
  }

  const total = queryMetricsBuffer.length
  const successful = queryMetricsBuffer.filter((m) => m.success).length
  const failed = queryMetricsBuffer.filter((m) => !m.success).length
  const avgDuration =
    queryMetricsBuffer.reduce((sum, m) => sum + m.duration, 0) / total
  const slowQueries = queryMetricsBuffer.filter((m) => m.duration > 2000).length

  return {
    total,
    successful,
    failed,
    avgDuration: Math.round(avgDuration),
    slowQueries,
  }
}

/**
 * Clear metrics buffer
 */
export function clearQueryMetrics() {
  queryMetricsBuffer.length = 0
}

/**
 * Wrapper for measuring query execution time
 */
export async function measureQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  userId?: string
): Promise<T> {
  const startTime = performance.now()
  let success = true
  let error: string | undefined

  try {
    const result = await queryFn()
    return result
  } catch (err) {
    success = false
    error = err instanceof Error ? err.message : String(err)
    throw err
  } finally {
    const duration = performance.now() - startTime
    logQueryPerformance({
      query: queryName,
      duration,
      success,
      error,
      userId,
    })
  }
}
