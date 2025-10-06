import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  await requireAdmin()
  const { categoryId } = await params
  const supabase = await createClient()

  try {
    const { data: questions, error } = await supabase
      .from('dynamic_questions')
      .select(`
        *,
        category:question_categories(id, name, slug)
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('priority', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data: questions })
  } catch (error) {
    console.error('Fetch questions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}
