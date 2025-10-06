import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    const { category_id } = body

    if (!category_id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    // Call the apply_question_template function
    const { data: questions, error } = await supabase.rpc(
      'apply_question_template',
      {
        p_template_id: id,
        p_category_id: category_id,
        p_user_id: user.id,
      }
    )

    if (error) throw error

    // Increment usage_count for the template
    await supabase.rpc('increment_template_usage', {
      template_id: id
    })

    return NextResponse.json({ data: questions })
  } catch (error) {
    console.error('Apply template error:', error)
    return NextResponse.json(
      { error: 'Failed to apply template' },
      { status: 500 }
    )
  }
}
