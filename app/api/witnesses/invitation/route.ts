import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch invitation data
    const { data: invitation, error } = await supabase
      .from('witness_invitations')
      .select('*, inviter:inviter_id(username, full_name), draft:draft_id(content, title)')
      .eq('token', token)
      .eq('status', 'pending')
      .single()

    if (error || !invitation) {
      return NextResponse.json({ error: 'Invitation not found or expired' }, { status: 404 })
    }

    // Return invitation data
    return NextResponse.json({
      draftId: invitation.draft_id,
      inviterName: invitation.inviter?.full_name || invitation.inviter?.username || 'Someone',
      experiencePreview:
        invitation.draft?.content?.substring(0, 200) ||
        invitation.draft?.title ||
        'Keine Vorschau verfügbar',
      witnessName: invitation.witness_name,
    })
  } catch (error: any) {
    console.error('Fetch invitation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
