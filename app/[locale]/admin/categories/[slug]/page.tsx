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

  // Fetch questions for this category
  const { data: questions, error: questionsError } = await supabase
    .from('dynamic_questions')
    .select('*')
    .eq('category_id', category.id)
    .order('priority', { ascending: true })

  if (questionsError) {
    console.error('Error fetching questions:', questionsError)
  }

  return (
    <CategoryDetailClient
      category={category}
      initialQuestions={questions || []}
    />
  )
}
