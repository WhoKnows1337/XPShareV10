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
    .select('question_id, total_shown, total_answered, answer_rate_percent, avg_time')
    .in('question_id', questionIds)

  // Map analytics to questions
  const questionsWithAnalytics = questions?.map(q => {
    const questionAnalytics = analytics?.find(a => a.question_id === q.id)
    return {
      ...q,
      analytics: questionAnalytics || {
        total_shown: 0,
        total_answered: 0,
        answer_rate_percent: 0,
        avg_time: 0
      }
    }
  })

  return (
    <CategoryDetailClient
      category={category}
      initialQuestions={questionsWithAnalytics || []}
    />
  )
}
