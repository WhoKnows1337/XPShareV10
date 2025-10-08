import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categorySlug = searchParams.get('category')

  if (!categorySlug) {
    return NextResponse.json(
      { error: 'Category parameter is required' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()

    // First, get the category ID from the slug
    const { data: category, error: categoryError } = await supabase
      .from('question_categories')
      .select('id')
      .eq('slug', categorySlug)
      .eq('is_active', true)
      .single()

    if (categoryError || !category) {
      return NextResponse.json(
        { error: 'Category not found', questions: [] },
        { status: 404 }
      )
    }

    // Get questions for this category
    const { data: questions, error: questionsError } = await supabase
      .from('dynamic_questions')
      .select('*')
      .eq('category_id', category.id)
      .eq('is_active', true)
      .order('priority', { ascending: true })

    if (questionsError) {
      throw questionsError
    }

    // Transform to match the expected format
    const transformedQuestions = (questions || []).map((q: any) => ({
      id: q.id,
      type: mapQuestionType(q.question_type),
      question: q.question_text,
      options: q.options || [],
      required: !q.is_optional,
      helpText: q.help_text,
      placeholder: q.placeholder,
    }))

    return NextResponse.json({ questions: transformedQuestions })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions', questions: [] },
      { status: 500 }
    )
  }
}

function mapQuestionType(dbType: string): string {
  const typeMap: Record<string, string> = {
    text: 'text',
    chips: 'radio',
    'chips-multi': 'checkbox',
    boolean: 'radio',
    slider: 'number',
    date: 'text',
    time: 'text',
  }

  return typeMap[dbType] || 'text'
}
