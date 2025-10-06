import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin('analyst')
    const supabase = await createClient()

    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'json'

    // Fetch all stats
    const [
      { count: totalUsers },
      { count: totalExperiences },
      { count: pendingReports },
      { count: totalBadges },
      { count: totalCategories },
      { count: totalQuestions },
    ] = await Promise.all([
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('experiences').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('user_badges').select('*', { count: 'exact', head: true }),
      supabase.from('question_categories').select('*', { count: 'exact', head: true }),
      supabase.from('dynamic_questions').select('*', { count: 'exact', head: true }),
    ])

    // Fetch categories with details
    const { data: categories } = await supabase
      .from('question_categories')
      .select('*')
      .order('sort_order', { ascending: true })

    // Fetch questions with category info
    const { data: questions } = await supabase
      .from('dynamic_questions')
      .select(`
        *,
        category:question_categories(name, slug)
      `)
      .order('created_at', { ascending: false })

    const stats = {
      summary: {
        total_users: totalUsers || 0,
        total_experiences: totalExperiences || 0,
        pending_reports: pendingReports || 0,
        total_badges: totalBadges || 0,
        total_categories: totalCategories || 0,
        total_questions: totalQuestions || 0,
        exported_at: new Date().toISOString(),
      },
      categories: categories || [],
      questions: questions || [],
    }

    if (format === 'csv') {
      // Convert to CSV
      const csvLines = [
        // Summary section
        'SUMMARY',
        'Metric,Value',
        `Total Users,${stats.summary.total_users}`,
        `Total Experiences,${stats.summary.total_experiences}`,
        `Pending Reports,${stats.summary.pending_reports}`,
        `Total Badges,${stats.summary.total_badges}`,
        `Total Categories,${stats.summary.total_categories}`,
        `Total Questions,${stats.summary.total_questions}`,
        `Exported At,${stats.summary.exported_at}`,
        '',
        // Categories section
        'CATEGORIES',
        'ID,Name,Slug,Icon,Sort Order,Active,Created At',
        ...stats.categories.map((cat) =>
          [
            cat.id,
            `"${cat.name}"`,
            cat.slug,
            cat.icon || '',
            cat.sort_order,
            cat.is_active,
            cat.created_at,
          ].join(',')
        ),
        '',
        // Questions section
        'QUESTIONS',
        'ID,Category,Question Text,Type,Is Active,Is Optional,Tags,Created At',
        ...stats.questions.map((q) =>
          [
            q.id,
            `"${q.category?.name || 'N/A'}"`,
            `"${q.question_text.replace(/"/g, '""')}"`,
            q.question_type,
            q.is_active,
            q.is_optional,
            `"${(q.tags || []).join(', ')}"`,
            q.created_at,
          ].join(',')
        ),
      ]

      const csv = csvLines.join('\n')

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="admin-stats-${new Date().toISOString()}.csv"`,
        },
      })
    }

    // Return JSON
    return NextResponse.json(stats, {
      headers: {
        'Content-Disposition': `attachment; filename="admin-stats-${new Date().toISOString()}.json"`,
      },
    })
  } catch (error) {
    console.error('Export stats error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export stats' },
      { status: 500 }
    )
  }
}
