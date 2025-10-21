/**
 * Health Check & Monitoring Endpoint
 *
 * Returns system health metrics and query performance statistics.
 */

import { NextResponse } from 'next/server'
import { getQueryMetrics } from '@/lib/monitoring/query-logger'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'

export async function GET() {
  const startTime = performance.now()

  try {
    // Test database connection
    const supabase = await createClient()
    const { error: dbError } = await supabase
      .from('experiences')
      .select('id')
      .limit(1)

    const dbHealthy = !dbError

    // Get query metrics
    const queryMetrics = getQueryMetrics()

    // Calculate health score (0-100)
    let healthScore = 100

    if (!dbHealthy) healthScore -= 50
    if (queryMetrics.failed > 0) {
      healthScore -= Math.min(30, queryMetrics.failed * 5)
    }
    if (queryMetrics.slowQueries > 0) {
      healthScore -= Math.min(20, queryMetrics.slowQueries * 2)
    }

    const status = healthScore >= 80 ? 'healthy' : healthScore >= 50 ? 'degraded' : 'unhealthy'

    const response = {
      status,
      healthScore,
      timestamp: new Date().toISOString(),
      uptime: process.uptime ? process.uptime() : null,
      components: {
        database: {
          status: dbHealthy ? 'healthy' : 'unhealthy',
          error: dbError?.message || null,
        },
        api: {
          status: 'healthy',
          responseTime: Math.round(performance.now() - startTime),
        },
      },
      metrics: {
        queries: {
          total: queryMetrics.total,
          successful: queryMetrics.successful,
          failed: queryMetrics.failed,
          avgDuration: queryMetrics.avgDuration,
          slowQueries: queryMetrics.slowQueries,
        },
      },
    }

    return NextResponse.json(response, {
      status: status === 'healthy' ? 200 : status === 'degraded' ? 207 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('[Health Check] Failed:', error)

    return NextResponse.json(
      {
        status: 'unhealthy',
        healthScore: 0,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}
