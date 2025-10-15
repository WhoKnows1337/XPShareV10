import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Search Alerts Manual Trigger Endpoint
 *
 * GET/POST /api/cron/check-search-alerts
 *
 * This endpoint allows manual triggering of the search alerts check.
 * The actual scheduled job runs via PostgreSQL pg_cron every hour.
 *
 * To view scheduled jobs:
 *   SELECT * FROM cron.job;
 *
 * To view job execution history:
 *   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max execution time

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const startTime = Date.now()

    // Call the PostgreSQL function directly
    const { data, error } = await (supabase as any).rpc('check_search_alerts')

    if (error) {
      console.error('Error calling check_search_alerts:', error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    const executionTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      ...data,
      executionTime,
      manualTrigger: true,
      note: 'This was manually triggered. Automatic checks run hourly via pg_cron.',
    })

  } catch (error: any) {
    console.error('Search alerts manual trigger error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Allow POST as well for manual triggering
export async function POST(req: NextRequest) {
  return GET(req)
}
