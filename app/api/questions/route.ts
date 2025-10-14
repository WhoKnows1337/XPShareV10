import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface ExtractedAttribute {
  value: string
  confidence: number
  evidence?: string
}

interface ExtractedData {
  attributes?: Record<string, ExtractedAttribute>
  [key: string]: any
}

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
    let extractedAttributes: Record<string, any> | null = null
    if (extractedAttributesJson) {
      try {
        extractedAttributes = JSON.parse(extractedAttributesJson)
      } catch (e) {
        console.error('Failed to parse extractedAttributes:', e)
      }
    }

    // Transform and filter questions
    let filteredQuestions = questions || []

    // Smart filtering: Only show questions if:
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

/**
 * POST /api/questions
 *
 * Get questions with AI pre-fills (Option A flow)
 *
 * Body:
 * - category: string (category slug)
 * - extractedData: ExtractedData (AI extracted attributes)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category: categorySlug, extractedData } = body as {
      category: string
      extractedData?: ExtractedData
    }

    if (!categorySlug) {
      return NextResponse.json(
        { error: 'Category parameter is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get category ID
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

    // Merge extracted attributes with questions
    const transformedQuestions = (questions || []).map((q: any) => {
      const baseQuestion = {
        id: q.id,
        type: mapQuestionType(q.question_type),
        question: q.question_text,
        options: q.options || [],
        required: !q.is_optional,
        helpText: q.help_text,
        placeholder: q.placeholder,
        conditionalLogic: q.conditional_logic || undefined,
        maps_to_attribute: q.maps_to_attribute || null,
      }

      // Check if this question maps to an extracted attribute
      if (q.maps_to_attribute && extractedData?.attributes) {
        const extractedAttr = extractedData.attributes[q.maps_to_attribute]

        if (extractedAttr) {
          return {
            ...baseQuestion,
            prefilled_value: extractedAttr.value,
            prefilled_confidence: extractedAttr.confidence,
            prefilled_evidence: extractedAttr.evidence,
            xp_bonus: calculateXPBonus(extractedAttr.confidence),
            has_prefill: true,
          }
        }
      }

      return {
        ...baseQuestion,
        has_prefill: false,
      }
    })

    // Calculate totals
    const prefilledCount = transformedQuestions.filter((q: any) => q.has_prefill).length
    const totalXPBonus = transformedQuestions
      .filter((q: any) => q.has_prefill)
      .reduce((sum: number, q: any) => sum + (q.xp_bonus || 0), 0)

    return NextResponse.json({
      questions: transformedQuestions,
      stats: {
        total: transformedQuestions.length,
        prefilled: prefilledCount,
        manual: transformedQuestions.length - prefilledCount,
        totalXPBonus,
      },
    })
  } catch (error) {
    console.error('Error fetching questions with pre-fills:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions', questions: [] },
      { status: 500 }
    )
  }
}

/**
 * Calculate XP bonus based on confidence
 * High confidence = more XP for confirming
 */
function calculateXPBonus(confidence: number): number {
  if (confidence >= 0.9) return 10
  if (confidence >= 0.8) return 8
  if (confidence >= 0.7) return 5
  if (confidence >= 0.6) return 3
  return 2
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
