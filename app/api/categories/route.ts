import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all active question categories with hierarchy support
    const { data: categories, error } = await supabase
      .from('question_categories')
      .select('id, slug, name, description, icon, emoji, color, is_active, level, parent_category_id, sort_order')
      .eq('is_active', true)
      .order('level', { ascending: true })
      .order('sort_order', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ categories: categories || [] })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories', categories: [] },
      { status: 500 }
    )
  }
}
