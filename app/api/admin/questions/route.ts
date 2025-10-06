import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'

// GET /api/admin/questions - List questions with filters
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin status
    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get URL params
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category_id')
    const questionType = searchParams.get('question_type')
    const isActive = searchParams.get('is_active')
    const tag = searchParams.get('tag')

    // Build query
    let query = supabase
      .from('dynamic_questions')
      .select('*')
      .order('priority', { ascending: true })

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (questionType) {
      query = query.eq('question_type', questionType)
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    const { data: questions, error } = await query

    if (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: questions })
  } catch (error) {
    console.error('Questions GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/questions - Create new question
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin status
    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const {
      category_id,
      question_text,
      question_type,
      options = [],
      priority,
      is_optional = true,
      help_text,
      placeholder,
      conditional_logic = {},
      follow_up_question,
      tags = [],
      is_active = true,
    } = body

    // Validate required fields
    if (!question_text || !question_type) {
      return NextResponse.json(
        { error: 'Missing required fields: question_text, question_type' },
        { status: 400 }
      )
    }

    // Validate question_type
    const validTypes = ['chips', 'chips-multi', 'text', 'boolean', 'slider', 'date', 'time']
    if (!validTypes.includes(question_type)) {
      return NextResponse.json(
        { error: `Invalid question_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Get next priority if not provided
    let finalPriority = priority
    if (finalPriority === undefined && category_id) {
      const { data: maxQuestion } = await supabase
        .from('dynamic_questions')
        .select('priority')
        .eq('category_id', category_id)
        .order('priority', { ascending: false })
        .limit(1)
        .single()

      finalPriority = (maxQuestion?.priority || 0) + 1
    }

    // Insert question
    const { data: question, error } = await supabase
      .from('dynamic_questions')
      .insert({
        category_id,
        question_text,
        question_type,
        options,
        priority: finalPriority || 1,
        is_optional,
        help_text,
        placeholder,
        conditional_logic,
        follow_up_question,
        tags,
        is_active,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating question:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: question }, { status: 201 })
  } catch (error) {
    console.error('Questions POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
