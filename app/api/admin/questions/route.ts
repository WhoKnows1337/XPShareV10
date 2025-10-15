import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'

// GET /api/admin/questions - List questions with filters
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await (supabase as any).auth.getUser()

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

    // Build query
    let query = supabase
      .from('dynamic_questions')
      .select('*')
      .order('priority', { ascending: true })

    // B+F System: Support loading Universal Questions
    if (categoryId === 'universal') {
      // Load Universal Questions only (category_id IS NULL)
      query = query.is('category_id', null)
    } else if (categoryId) {
      // Load specific category questions
      query = query.eq('category_id', categoryId)
    }
    // If no categoryId provided, load ALL questions (including Universal)

    if (questionType) {
      query = query.eq('question_type', questionType)
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
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
    } = await (supabase as any).auth.getUser()

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
      maps_to_attribute,
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
    const validTypes = [
      'chips', 'chips-multi', 'text', 'textarea', 'boolean', 'slider', 'date', 'time',
      'dropdown', 'dropdown-multi', 'image-select', 'image-multi', 'rating', 'color', 'range', 'ai-text'
    ]
    if (!validTypes.includes(question_type)) {
      return NextResponse.json(
        { error: `Invalid question_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate: ai-text requires maps_to_attribute
    if (question_type === 'ai-text' && !maps_to_attribute) {
      return NextResponse.json(
        { error: 'AI-text questions require attribute mapping (maps_to_attribute)' },
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
        maps_to_attribute,
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
