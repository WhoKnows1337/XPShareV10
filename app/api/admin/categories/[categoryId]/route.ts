import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/admin/categories/[categoryId] - Get single category
export async function GET(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId: id } = await params
    const supabase = await createClient()

    // Check if user is admin
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

    // Get category
    const { data: category, error } = await supabase
      .from('question_categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching category:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Get question count
    const { count } = await supabase
      .from('dynamic_questions')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    return NextResponse.json({
      data: {
        ...category,
        question_count: count || 0,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/admin/categories/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/categories/[categoryId] - Update category
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId: id } = await params
    const supabase = await createClient()

    // Check if user is admin
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

    // Parse request body
    const body = await request.json()
    const { slug, name, description, icon, sort_order, is_active } = body

    // Build update object
    const updates: Record<string, unknown> = {
      updated_by: user.id,
    }

    if (slug !== undefined) updates.slug = slug
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (icon !== undefined) updates.icon = icon
    if (sort_order !== undefined) updates.sort_order = sort_order
    if (is_active !== undefined) updates.is_active = is_active

    // Update category
    const { data: category, error } = await supabase
      .from('question_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: category })
  } catch (error) {
    console.error('Error in PATCH /api/admin/categories/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/categories/[categoryId] - Delete category
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId: id } = await params
    const supabase = await createClient()

    // Check if user is admin
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

    // First, get the category to check its slug
    const { data: category, error: fetchError } = await supabase
      .from('question_categories')
      .select('slug')
      .eq('id', id)
      .single()

    if (fetchError || !category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if category has questions
    const { count: questionCount } = await supabase
      .from('dynamic_questions')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    if (questionCount && questionCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${questionCount} questions. Delete questions first.` },
        { status: 400 }
      )
    }

    // Check if category has attributes
    const { data: attributes, error: attrError } = await supabase
      .from('attribute_schema')
      .select('key')
      .eq('category_slug', category.slug)

    if (!attrError && attributes && attributes.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category with ${attributes.length} attributes. Delete attributes first.`,
          attribute_keys: attributes.map((a) => a.key),
        },
        { status: 400 }
      )
    }

    // Delete category (only if no questions AND no attributes)
    const { error } = await supabase.from('question_categories').delete().eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/admin/categories/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
