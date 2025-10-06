import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  await requireAdmin()
  const supabase = await createClient()

  try {
    const { data: templates, error } = await supabase
      .from('question_templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data: templates })
  } catch (error) {
    console.error('Fetch templates error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const { user } = await requireAdmin()
  const supabase = await createClient()

  try {
    const body = await request.json()
    const { name, description, category_id, questions, tags, is_public } = body

    if (!name || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Name and questions are required' },
        { status: 400 }
      )
    }

    const { data: template, error } = await supabase
      .from('question_templates')
      .insert({
        name,
        description,
        category_id,
        questions,
        tags: tags || [],
        is_public: is_public || false,
        usage_count: 0,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data: template })
  } catch (error) {
    console.error('Create template error:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
