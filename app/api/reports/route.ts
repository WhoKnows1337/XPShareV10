import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST - Create a report
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await (supabase as any).auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { experienceId, reason, details } = await request.json()

    if (!experienceId || !reason) {
      return NextResponse.json(
        { error: 'Experience ID and reason are required' },
        { status: 400 }
      )
    }

    // Check if user has already reported this experience
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('experience_id', experienceId)
      .eq('reported_by', user.id)
      .single()

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this experience' },
        { status: 400 }
      )
    }

    // Create report
    const { error } = await (supabase as any).from('reports').insert({
      experience_id: experienceId,
      reported_by: user.id,
      reason,
      details: details || null,
      status: 'pending',
    })

    if (error) {
      console.error('Error creating report:', error)
      return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Reports POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get all reports (admin only)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await (supabase as any).auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    let query = supabase
      .from('reports')
      .select(`
        *,
        experiences (id, title, category),
        user_profiles!reports_reported_by_fkey (username, display_name)
      `)
      .order('created_at', { ascending: false })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: reports, error } = await query

    if (error) {
      console.error('Error fetching reports:', error)
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
    }

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Reports GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
