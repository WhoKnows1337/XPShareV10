import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CategoryDetailClient } from './category-detail-client'

// DB row types - these match the actual Supabase schema
interface QuestionCategoryRow {
  color: string | null
  created_at: string | null
  created_by: string | null
  description: string | null
  emoji: string | null
  icon: string | null
  id: string
  is_active: boolean | null
  level: number | null
  name: string
  parent_category_id: string | null
  slug: string
  sort_order: number
  updated_at: string | null
  updated_by: string | null
}

interface DynamicQuestionRow {
  adaptive_conditions: unknown | null
  ai_adaptive: boolean | null
  allow_custom_value: boolean | null
  category_id: string | null
  conditional_logic: unknown | null
  conditional_on_attribute: string | null
  conditional_value: string | null
  created_at: string | null
  created_by: string | null
  follow_up_question: unknown | null
  help_text: string | null
  id: string
  is_active: boolean | null
  is_optional: boolean | null
  maps_to_attribute: string | null
  options: unknown | null
  placeholder: string | null
  priority: number
  question_text: string
  question_type: string
  show_if: unknown | null
  tags: string[] | null
  updated_at: string | null
  updated_by: string | null
}

interface AttributeSchema {
  allowed_values: unknown | null
  category_slug: string | null
  created_at: string | null
  data_type: string | null
  description: string | null
  display_name: string
  display_name_de: string | null
  display_name_es: string | null
  display_name_fr: string | null
  is_filterable: boolean | null
  is_searchable: boolean | null
  key: string
  sort_order: number | null
  updated_at: string | null
}

interface ExperienceAttribute {
  attribute_key: string
}

interface QuestionAnalyticsSummary {
  answer_rate: number | null
  avg_response_time: number | null
  category_id: string | null
  category_name: string | null
  question_id: string | null
  question_text: string | null
  total_answered: number | null
  total_shown: number | null
  total_skipped: number | null
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch category with type assertion
  const { data: categoryData, error: categoryError } = await supabase
    .from('question_categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (categoryError || !categoryData) {
    notFound()
  }

  const category: QuestionCategoryRow = categoryData

  // Fetch questions for this category with analytics
  const { data: questionsData, error: questionsError } = await supabase
    .from('dynamic_questions')
    .select('*')
    .eq('category_id', category.id)
    .order('priority', { ascending: true })

  const questions: DynamicQuestionRow[] | null = questionsData

  if (questionsError) {
    console.error('Error fetching questions:', questionsError)
  }

  // Fetch analytics for each question
  const questionIds = questions?.map(q => q.id) || []
  const { data: analyticsData } = await supabase
    .from('question_analytics_summary')
    .select('question_id, category_id, category_name, question_text, total_shown, total_answered, total_skipped, answer_rate, avg_response_time')
    .in('question_id', questionIds)

  const analytics: QuestionAnalyticsSummary[] | null = analyticsData

  // Map analytics to questions
  const questionsWithAnalytics = questions?.map(q => {
    const questionAnalytics = analytics?.find(a => a.question_id === q.id)
    return {
      ...q,
      analytics: questionAnalytics || {
        total_shown: 0,
        total_answered: 0,
        answer_rate: 0,
        avg_response_time: 0
      }
    }
  })

  // Fetch attributes for this category
  const { data: attributesRawData } = await supabase
    .from('attribute_schema')
    .select('*')
    .eq('category_slug', slug)
    .order('sort_order')

  const attributesRaw: AttributeSchema[] | null = attributesRawData

  // Parse allowed_values from JSON string to array
  const attributes = attributesRaw?.map(attr => ({
    ...attr,
    allowed_values: attr.allowed_values
      ? (typeof attr.allowed_values === 'string'
        ? JSON.parse(attr.allowed_values)
        : attr.allowed_values)
      : null
  })) || []

  // Get attribute usage counts from experience_attributes
  const attributeKeys = attributes?.map(attr => attr.key) || []
  const { data: attributeUsageData } = await supabase
    .from('experience_attributes')
    .select('attribute_key')
    .in('attribute_key', attributeKeys)

  const attributeUsage: ExperienceAttribute[] | null = attributeUsageData

  // Count usage per attribute
  const usageCounts = (attributeUsage || []).reduce((acc, item) => {
    acc[item.attribute_key] = (acc[item.attribute_key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Fetch universal questions (category_id IS NULL)
  const { data: universalQuestionsData } = await supabase
    .from('dynamic_questions')
    .select('*')
    .is('category_id', null)
    .order('priority', { ascending: true })

  const universalQuestions: DynamicQuestionRow[] | null = universalQuestionsData

  // Fetch universal attributes (category_slug IS NULL)
  const { data: universalAttributesRawData } = await supabase
    .from('attribute_schema')
    .select('*')
    .is('category_slug', null)
    .order('sort_order', { ascending: true })

  const universalAttributesRaw: AttributeSchema[] | null = universalAttributesRawData

  // Parse universal attributes
  const universalAttributes = universalAttributesRaw?.map(attr => ({
    ...attr,
    allowed_values: attr.allowed_values
      ? (typeof attr.allowed_values === 'string'
        ? JSON.parse(attr.allowed_values)
        : attr.allowed_values)
      : null
  })) || []

  // Calculate completion percentage
  const hasQuestions = (questions?.length || 0) > 0
  const hasAttributes = (attributes?.length || 0) > 0
  const completionPercentage = (hasQuestions ? 50 : 0) + (hasAttributes ? 50 : 0)

  return (
    <CategoryDetailClient
      category={category as unknown as import('@/lib/types/admin-questions').QuestionCategory}
      initialQuestions={(questionsWithAnalytics as unknown as import('@/lib/types/admin-questions').DynamicQuestion[]) || []}
      attributes={attributes || []}
      attributeUsageCounts={usageCounts}
      completionPercentage={completionPercentage}
      universalQuestions={(universalQuestions as unknown as import('@/lib/types/admin-questions').DynamicQuestion[]) || []}
      universalAttributes={universalAttributes}
    />
  )
}
