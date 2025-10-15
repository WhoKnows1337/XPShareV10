import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'

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

    const { reportId, experienceId, action, notes } = await request.json()

    if (!reportId || !action) {
      return NextResponse.json(
        { error: 'Report ID and action are required' },
        { status: 400 }
      )
    }

    // Handle different actions
    switch (action) {
      case 'delete':
        // Delete the experience
        if (!experienceId) {
          return NextResponse.json(
            { error: 'Experience ID is required for deletion' },
            { status: 400 }
          )
        }

        const { error: deleteError } = await supabase
          .from('experiences')
          .delete()
          .eq('id', experienceId)

        if (deleteError) {
          console.error('Error deleting experience:', deleteError)
          return NextResponse.json({ error: 'Failed to delete experience' }, { status: 500 })
        }

        // Mark report as resolved
        await supabase
          .from('reports')
          .update({
            status: 'resolved',
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
            admin_notes: notes,
          })
          .eq('id', reportId)

        break

      case 'dismiss':
        // Dismiss the report without action
        const { error: dismissError } = await supabase
          .from('reports')
          .update({
            status: 'dismissed',
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
            admin_notes: notes,
          })
          .eq('id', reportId)

        if (dismissError) {
          console.error('Error dismissing report:', dismissError)
          return NextResponse.json({ error: 'Failed to dismiss report' }, { status: 500 })
        }

        break

      case 'approve':
        // Keep experience, mark report as resolved
        const { error: approveError } = await supabase
          .from('reports')
          .update({
            status: 'resolved',
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
            admin_notes: notes,
          })
          .eq('id', reportId)

        if (approveError) {
          console.error('Error resolving report:', approveError)
          return NextResponse.json({ error: 'Failed to resolve report' }, { status: 500 })
        }

        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Moderation POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
