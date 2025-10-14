import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * GET /api/admin/categories/stats
 *
 * Returns statistics for all categories:
 * - Question count
 * - Attribute count
 * - Experience count
 * - Completion percentage
 */
export async function GET() {
  await requireAdmin()
  const supabase = await createClient()

  try {
    // Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('question_categories')
      .select('id, slug, name, parent_category_id, is_active')
      .order('sort_order')

    if (categoriesError) throw categoriesError

    // Get question counts per category
    const { data: questionCounts, error: questionError } = await supabase
      .from('dynamic_questions')
      .select('category_id, is_active')

    if (questionError) throw questionError

    // Get attribute counts per category
    const { data: attributes, error: attributeError } = await supabase
      .from('attribute_schema')
      .select('category_slug')

    if (attributeError) throw attributeError

    // Get experience counts per category
    const { data: experiences, error: experienceError } = await supabase
      .from('experiences')
      .select('category')

    if (experienceError) throw experienceError

    // Build stats map
    const stats = categories?.map((category) => {
      const questionCount = questionCounts?.filter(
        (q) => q.category_id === category.id && q.is_active
      ).length || 0

      const attributeCount = attributes?.filter(
        (a) => a.category_slug === category.slug
      ).length || 0

      const experienceCount = experiences?.filter(
        (e) => e.category === category.slug
      ).length || 0

      // Calculate completion percentage
      // Need at least 5 questions and 3 attributes to be considered complete
      const questionScore = Math.min(questionCount / 5, 1) * 60 // 60% weight
      const attributeScore = Math.min(attributeCount / 3, 1) * 40 // 40% weight
      const completionPercentage = Math.round((questionScore + attributeScore) * 100)

      return {
        id: category.id,
        slug: category.slug,
        name: category.name,
        parent_category_id: category.parent_category_id,
        is_active: category.is_active,
        question_count: questionCount,
        attribute_count: attributeCount,
        experience_count: experienceCount,
        completion_percentage: completionPercentage,
        status:
          completionPercentage >= 80
            ? 'complete'
            : completionPercentage >= 50
            ? 'partial'
            : 'incomplete',
      }
    })

    return NextResponse.json({
      stats: stats || [],
      summary: {
        total_categories: categories?.length || 0,
        complete_categories: stats?.filter((s) => s.status === 'complete').length || 0,
        partial_categories: stats?.filter((s) => s.status === 'partial').length || 0,
        incomplete_categories: stats?.filter((s) => s.status === 'incomplete').length || 0,
        total_questions: questionCounts?.filter((q) => q.is_active).length || 0,
        total_attributes: attributes?.length || 0,
        total_experiences: experiences?.length || 0,
      },
    })
  } catch (error: any) {
    console.error('Category stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category stats', details: error.message },
      { status: 500 }
    )
  }
}
