import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAdmin('content_manager')
    const supabase = await createClient()

    const body = await req.json()
    const { name, description, questions, category_id, tags, is_public } = body

    // Validate
    if (!name || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Invalid template format. Required: name, questions (array)' },
        { status: 400 }
      )
    }

    // Validate questions structure
    for (const q of questions) {
      if (!q.question_text || !q.question_type) {
        return NextResponse.json(
          { error: 'Invalid question format. Each question needs: question_text, question_type' },
          { status: 400 }
        )
      }
    }

    // Create template
    const { data, error } = await supabase
      .from('question_templates')
      .insert({
        name,
        description: description || null,
        category_id: category_id || null,
        questions,
        tags: tags || [],
        is_public: is_public || false,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Template import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import template' },
      { status: 500 }
    )
  }
}
