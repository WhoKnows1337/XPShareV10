import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { operation, category_ids } = await request.json()

    if (!operation || !category_ids || !Array.from(category_ids).length) {
      return NextResponse.json(
        { error: 'Operation and category_ids are required' },
        { status: 400 }
      )
    }

    let count = 0

    switch (operation) {
      case 'activate-all': {
        const { error } = await supabase
          .from('dynamic_questions')
          .update({ is_active: true })
          .in('category_id', category_ids)

        if (error) throw error

        const { count: affectedCount } = await supabase
          .from('dynamic_questions')
          .select('*', { count: 'exact', head: true })
          .in('category_id', category_ids)
          .eq('is_active', true)

        count = affectedCount || 0
        break
      }

      case 'deactivate-all': {
        const { error } = await supabase
          .from('dynamic_questions')
          .update({ is_active: false })
          .in('category_id', category_ids)

        if (error) throw error

        const { count: affectedCount } = await supabase
          .from('dynamic_questions')
          .select('*', { count: 'exact', head: true })
          .in('category_id', category_ids)
          .eq('is_active', false)

        count = affectedCount || 0
        break
      }

      case 'renumber-priorities': {
        // Get all questions in selected categories
        for (const categoryId of category_ids) {
          const { data: questions, error: fetchError } = await supabase
            .from('dynamic_questions')
            .select('id')
            .eq('category_id', categoryId)
            .order('priority', { ascending: true })

          if (fetchError) throw fetchError

          // Update each question's priority to its index + 1
          if (questions) {
            for (let i = 0; i < questions.length; i++) {
              const { error: updateError } = await supabase
                .from('dynamic_questions')
                .update({ priority: i + 1 })
                .eq('id', questions[i].id)

              if (updateError) throw updateError
              count++
            }
          }
        }
        break
      }

      case 'find-duplicates': {
        // Find duplicate question texts within selected categories
        const { data: questions, error } = await supabase
          .from('dynamic_questions')
          .select('question_text, category_id')
          .in('category_id', category_ids)

        if (error) throw error

        const textCounts = new Map<string, number>()
        questions?.forEach((q) => {
          const normalized = q.question_text.trim().toLowerCase()
          textCounts.set(normalized, (textCounts.get(normalized) || 0) + 1)
        })

        const duplicates = Array.from(textCounts.entries())
          .filter(([, count]) => count > 1)
          .map(([text, count]) => ({ text, count }))

        return NextResponse.json({
          operation: 'find-duplicates',
          duplicates,
          count: duplicates.length,
        })
      }

      case 'find-unused': {
        // Find questions that have never been answered
        const { data: questions, error } = await supabase
          .from('dynamic_questions')
          .select('id, question_text, category_id')
          .in('category_id', category_ids)

        if (error) throw error

        const unusedQuestions = []
        if (questions) {
          for (const question of questions) {
            const { count } = await supabase
              .from('question_analytics')
              .select('*', { count: 'exact', head: true })
              .eq('question_id', question.id)

            if (count === 0) {
              unusedQuestions.push(question)
            }
          }
        }

        return NextResponse.json({
          operation: 'find-unused',
          unused: unusedQuestions,
          count: unusedQuestions.length,
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error('Bulk operation error:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}
