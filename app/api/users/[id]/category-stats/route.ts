/**
 * GET /api/users/[id]/category-stats
 *
 * Get user's category distribution statistics
 * Shows XP DNA - which categories the user experiences most
 *
 * Response:
 * - stats: Array of { category, count, percentage, last_date }
 * - total: Total public experiences
 * - dominantCategory: Top category
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface CategoryStat {
  category: string
  experience_count: number
  percentage: number
  last_experience_date: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const supabase = await createClient()

    // Fetch category stats from user_category_stats table
    const { data: stats, error } = await (supabase as any)
      .from('user_category_stats')
      .select('category, experience_count, percentage, last_experience_date')
      .eq('user_id', userId)
      .order('percentage', { ascending: false })

    if (error) {
      console.error('Error fetching category stats:', error)
      return NextResponse.json(
        { error: 'Failed to fetch category stats', details: error.message },
        { status: 500 }
      )
    }

    if (!stats || stats.length === 0) {
      return NextResponse.json({
        stats: [],
        total: 0,
        dominantCategory: null,
        message: 'No public experiences found for this user'
      })
    }

    // Calculate totals
    const total = stats.reduce((sum: number, s: any) => sum + s.experience_count, 0)
    const dominantCategory = stats[0]

    // Format response
    const formattedStats: CategoryStat[] = stats.map((s: any) => ({
      category: s.category,
      experience_count: s.experience_count,
      percentage: parseFloat(s.percentage.toFixed(2)),
      last_experience_date: s.last_experience_date
    }))

    return NextResponse.json({
      stats: formattedStats,
      total,
      dominantCategory: {
        category: dominantCategory.category,
        percentage: parseFloat(dominantCategory.percentage.toFixed(2))
      },
      metadata: {
        userId,
        calculatedAt: new Date().toISOString(),
        categoryCount: stats.length
      }
    })

  } catch (error: any) {
    console.error('Category stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
