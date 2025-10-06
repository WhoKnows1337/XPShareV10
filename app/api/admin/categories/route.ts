import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

// GET /api/admin/categories - List all categories
export async function GET(request: Request) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // Get URL params
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('include_inactive') === 'true'
    const includeQuestionCount = searchParams.get('include_question_count') === 'true'

    // Build query
    let query = supabase
      .from('question_categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data: categories, error } = await query

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Optionally include question counts
    if (includeQuestionCount && categories) {
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const { count } = await supabase
            .from('dynamic_questions')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)

          return {
            ...category,
            question_count: count || 0,
          }
        })
      )

      return NextResponse.json({ data: categoriesWithCounts })
    }

    return NextResponse.json({ data: categories })
  } catch (error) {
    console.error('Error in GET /api/admin/categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/categories - Create new category
export async function POST(request: Request) {
  try {
    const { user } = await requireAdmin()
    const supabase = await createClient()

    // Parse request body
    const body = await request.json()
    const { slug, name, description, icon, sort_order, is_active = true } = body

    // Validate required fields
    if (!slug || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, name' },
        { status: 400 }
      )
    }

    // Get next sort_order if not provided
    let finalSortOrder = sort_order
    if (finalSortOrder === undefined) {
      const { data: maxCategory } = await supabase
        .from('question_categories')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()

      finalSortOrder = (maxCategory?.sort_order || 0) + 1
    }

    // Insert category
    const { data: category, error } = await supabase
      .from('question_categories')
      .insert({
        slug,
        name,
        description,
        icon,
        sort_order: finalSortOrder,
        is_active,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: category }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
