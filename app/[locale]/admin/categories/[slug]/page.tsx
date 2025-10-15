import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CategoryDetailClient } from './category-detail-client'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch category
  const { data: category, error: categoryError } = await supabase
    .from('question_categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // Fetch questions for this category with analytics
  const { data: questions, error: questionsError } = await supabase
    .from('dynamic_questions')
    .select('*')
    .eq('category_id', category.id)
    .order('priority', { ascending: true })

  if (questionsError) {
    console.error('Error fetching questions:', questionsError)
  }

  // Fetch analytics for each question
  const questionIds = questions?.map(q => q.id) || []
  const { data: analytics } = await supabase
    .from('question_analytics_summary')
    .select('question_id, total_shown, total_answered, answer_rate, avg_response_time')
    .in('question_id', questionIds)

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
  const { data: attributesRaw } = await supabase
    .from('attribute_schema')
    .select('*')
    .eq('category_slug', slug)
    .order('sort_order')

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
  const { data: attributeUsage } = await supabase
    .from('experience_attributes')
    .select('attribute_key')
    .in('attribute_key', attributeKeys)

  // Count usage per attribute
  const usageCounts = (attributeUsage || []).reduce((acc, item) => {
    acc[item.attribute_key] = (acc[item.attribute_key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Fetch universal questions (category_id IS NULL)
  const { data: universalQuestions } = await supabase
    .from('dynamic_questions')
    .select('*')
    .is('category_id', null)
    .order('priority', { ascending: true })

  // Fetch universal attributes (category_slug IS NULL)
  const { data: universalAttributesRaw } = await supabase
    .from('attribute_schema')
    .select('*')
    .is('category_slug', null)
    .order('sort_order', { ascending: true })

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
      category={category as any}
      initialQuestions={questionsWithAnalytics as any || []}
      attributes={attributes || []}
      attributeUsageCounts={usageCounts}
      completionPercentage={completionPercentage}
      universalQuestions={universalQuestions as any || []}
      universalAttributes={universalAttributes}
    />
  )
}
