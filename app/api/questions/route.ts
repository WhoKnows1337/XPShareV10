import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categorySlug = searchParams.get('category')
  const extractedAttributesJson = searchParams.get('extractedAttributes')

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

    // Get questions for this category + universal questions (category_id IS NULL)
    const { data: questions, error: questionsError } = await supabase
      .from('dynamic_questions')
      .select('*')
      .or(`category_id.is.null,category_id.eq.${category.id}`)
      .eq('is_active', true)
      .order('priority', { ascending: true })

    if (questionsError) {
      throw questionsError
    }

    // Parse extracted attributes if provided (for smart filtering)
    let extractedAttributes: Record<string, { value: string; confidence: number; isManuallyEdited: boolean }> | null = null
    if (extractedAttributesJson) {
      try {
        extractedAttributes = JSON.parse(extractedAttributesJson)
      } catch (e) {
        console.error('Failed to parse extractedAttributes:', e)
      }
    }

    // Transform and filter questions
    let filteredQuestions = questions || []

    // STEP 1: Conditional Logic Filtering
    // Only show questions where conditional requirements are met
    if (extractedAttributes) {
      filteredQuestions = filteredQuestions.filter((q: any) => {
        // If question has no conditional requirement, it's always shown
        if (!q.conditional_on_attribute || !q.conditional_value) {
          return true
        }

        // If question has conditional requirement, check if condition is met
        const extractedAttribute = extractedAttributes![q.conditional_on_attribute]
        
        // If the required attribute wasn't extracted by AI, don't show the conditional question
        if (!extractedAttribute) {
          return false
        }

        // Check if the extracted attribute value matches the conditional value
        // Use case-insensitive comparison for robustness
        return extractedAttribute.value?.toLowerCase() === q.conditional_value.toLowerCase()
      })
    }

    // STEP 2: AI Confidence Filtering
    // Only show questions if:
    // 1. Question maps to attribute AND AI didn't find it (regardless of required/optional)
    // 2. Question has NO attribute mapping (deep-dive questions, always show)
    if (extractedAttributes) {
      filteredQuestions = filteredQuestions.filter((q: any) => {
        // If question maps to an attribute, only show if AI didn't find it
        if (q.maps_to_attribute) {
          const hasAttribute = extractedAttributes![q.maps_to_attribute]
          return !hasAttribute // Show only if AI didn't find it
        }

        // Question without attribute mapping: always show (deep-dive questions)
        return true
      })
    }

    const transformedQuestions = filteredQuestions.map((q: any) => ({
      id: q.id,
      type: mapQuestionType(q.question_type),
      question: q.question_text,
      options: q.options || [],
      required: !q.is_optional,
      helpText: q.help_text,
      placeholder: q.placeholder,
      conditionalLogic: q.conditional_logic || undefined,
      maps_to_attribute: q.maps_to_attribute || null,
      priority: q.priority,
    }))

    return NextResponse.json({
      questions: transformedQuestions,
      stats: {
        total: transformedQuestions.length,
        filtered: extractedAttributes ? (questions?.length || 0) - transformedQuestions.length : 0
      }
    })
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
    chips: 'chips',
    'chips-multi': 'chips-multi',
    boolean: 'boolean',
    slider: 'scale',
    date: 'date',
    time: 'text',
  }

  return typeMap[dbType] || 'text'
}
