import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { category_ids } = await request.json()

    if (!category_ids || !Array.isArray(category_ids) || category_ids.length === 0) {
      return NextResponse.json(
        { error: 'category_ids array is required' },
        { status: 400 }
      )
    }

    // Fetch categories with their questions
    const { data: categories, error: catError } = await supabase
      .from('question_categories')
      .select('*')
      .in('id', category_ids)

    if (catError) throw catError

    const exportData = []

    for (const category of categories || []) {
      const { data: questions, error: qError } = await supabase
        .from('dynamic_questions')
        .select('*')
        .eq('category_id', category.id)
        .order('priority', { ascending: true })

      if (qError) throw qError

      exportData.push({
        category: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
        },
        questions: questions || [],
      })
    }

    return NextResponse.json({
      export_date: new Date().toISOString(),
      categories: exportData,
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export categories' },
      { status: 500 }
    )
  }
}
