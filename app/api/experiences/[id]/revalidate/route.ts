import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// On-Demand Revalidation for Experience Pages (Spec Lines 1435-1443)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Authenticate user (only author or admin can revalidate)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify user is the experience author or admin
    const { data: experience } = await supabase
      .from('experiences')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!experience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.is_admin || false
    const isAuthor = experience.user_id === user.id

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Only the author or admin can revalidate this page' },
        { status: 403 }
      )
    }

    // Revalidate the experience page
    revalidatePath(`/experiences/${id}`)
    revalidatePath(`/[locale]/experiences/${id}`)

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      message: `Experience ${id} page has been revalidated`,
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate', revalidated: false },
      { status: 500 }
    )
  }
}
