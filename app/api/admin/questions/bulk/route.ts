import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check admin auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { operation, question_ids, updates } = body

    if (!operation || !question_ids || question_ids.length === 0) {
      return NextResponse.json(
        { error: 'Operation and question IDs are required' },
        { status: 400 }
      )
    }

    let result

    switch (operation) {
      case 'activate':
        result = await supabase
          .from('dynamic_questions')
          .update({ is_active: true, updated_by: user.id, updated_at: new Date().toISOString() })
          .in('id', question_ids)
        break

      case 'deactivate':
        result = await supabase
          .from('dynamic_questions')
          .update({ is_active: false, updated_by: user.id, updated_at: new Date().toISOString() })
          .in('id', question_ids)
        break

      case 'delete':
        result = await supabase
          .from('dynamic_questions')
          .delete()
          .in('id', question_ids)
        break

      case 'update-tags':
        if (!updates?.tags) {
          return NextResponse.json(
            { error: 'Tags are required for update-tags operation' },
            { status: 400 }
          )
        }
        result = await supabase
          .from('dynamic_questions')
          .update({ tags: updates.tags, updated_by: user.id, updated_at: new Date().toISOString() })
          .in('id', question_ids)
        break

      case 'add-tags':
        if (!updates?.tags) {
          return NextResponse.json(
            { error: 'Tags are required for add-tags operation' },
            { status: 400 }
          )
        }
        // For each question, fetch current tags and append new ones
        const { data: questions } = await supabase
          .from('dynamic_questions')
          .select('id, tags')
          .in('id', question_ids)

        if (questions) {
          for (const question of questions) {
            const currentTags = question.tags || []
            const newTags = Array.from(new Set([...currentTags, ...updates.tags]))
            await supabase
              .from('dynamic_questions')
              .update({ tags: newTags, updated_by: user.id, updated_at: new Date().toISOString() })
              .eq('id', question.id)
          }
        }
        result = { error: null }
        break

      case 'set-optional':
        result = await supabase
          .from('dynamic_questions')
          .update({ is_optional: true, updated_by: user.id, updated_at: new Date().toISOString() })
          .in('id', question_ids)
        break

      case 'set-required':
        result = await supabase
          .from('dynamic_questions')
          .update({ is_optional: false, updated_by: user.id, updated_at: new Date().toISOString() })
          .in('id', question_ids)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        )
    }

    if (result.error) throw result.error

    return NextResponse.json({
      success: true,
      count: question_ids.length,
      operation,
    })
  } catch (error) {
    console.error('Bulk operation error:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}
