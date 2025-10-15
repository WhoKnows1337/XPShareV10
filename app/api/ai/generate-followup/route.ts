import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { aiAdaptiveService } from '@/lib/services/ai-adaptive-questions'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await (supabase as any).auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      questionId,
      answerValue,
      experienceId,
      categoryName,
      previousAnswers,
    } = body

    // Get the question with its adaptive conditions
    const { data: question, error: questionError } = await supabase
      .from('dynamic_questions')
      .select('*')
      .eq('id', questionId)
      .single()

    if (questionError || !question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Check if AI adaptive is enabled
    if (!question.ai_adaptive) {
      return NextResponse.json({
        shouldGenerate: false,
        message: 'AI adaptive not enabled for this question',
      })
    }

    // Check if conditions are met
    const conditions = (question.adaptive_conditions || {}) as any
    const shouldGenerate = aiAdaptiveService.shouldTriggerGeneration(
      answerValue,
      conditions
    )

    if (!shouldGenerate) {
      return NextResponse.json({
        shouldGenerate: false,
        message: 'Conditions not met for AI generation',
      })
    }

    // Generate follow-up questions
    const context = {
      categoryName: categoryName || 'Experience',
      questionText: question.question_text,
      answerValue,
      previousAnswers,
    }

    const generatedQuestions = await aiAdaptiveService.generateFollowUpQuestions(
      context,
      conditions
    )

    // Store generated questions in database
    const storedQuestions = []
    for (const gq of generatedQuestions) {
      const { data: stored, error: storeError } = await (supabase as any)
        .from('ai_generated_questions')
        .insert({
          parent_question_id: questionId,
          experience_id: experienceId,
          user_id: user.id,
          generated_question_text: gq.questionText,
          question_type: gq.suggestedType || 'text',
          context_used: {
            answerValue,
            reasoning: gq.reasoning,
            categoryName,
          },
          user_answer: typeof answerValue === 'string' ? answerValue : JSON.stringify(answerValue),
        })
        .select()
        .single()

      if (!storeError && stored) {
        storedQuestions.push(stored)
      }
    }

    return NextResponse.json({
      shouldGenerate: true,
      questions: storedQuestions,
      generatedCount: storedQuestions.length,
    })
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate follow-up questions' },
      { status: 500 }
    )
  }
}
