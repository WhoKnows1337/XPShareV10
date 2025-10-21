import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/users/[id]/activity
 * 
 * Returns daily activity data for the last 365 days
 * Format: [{ date: 'YYYY-MM-DD', count: number }]
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Calculate date range (last 365 days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 365)

    // Query experiences grouped by creation date
    const { data: experiences, error } = await supabase
      .from('experiences')
      .select('created_at')
      .eq('user_id', id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (error) {
      console.error('Error fetching activity:', error)
      return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
    }

    // Group by date and count
    const activityMap: Record<string, number> = {}
    
    experiences?.forEach((exp) => {
      if (exp.created_at) {
        const date = new Date(exp.created_at).toISOString().split('T')[0]
        activityMap[date] = (activityMap[date] || 0) + 1
      }
    })

    // Convert to array format expected by heatmap
    const activityData = Object.entries(activityMap).map(([date, count]) => ({
      date,
      count
    }))

    return NextResponse.json(activityData)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
