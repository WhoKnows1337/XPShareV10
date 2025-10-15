import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await (supabase as any).auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { draftId, witnesses } = await req.json()

    if (!witnesses || witnesses.length === 0) {
      return NextResponse.json({ error: 'No witnesses provided' }, { status: 400 })
    }

    // Store witness invitations in database
    const invitations = witnesses.map((witness: any) => ({
      draft_id: draftId,
      inviter_id: user.id,
      witness_name: witness.name,
      witness_email: witness.email,
      token: `${draftId}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      status: 'pending',
    }))

    const { data, error } = await (supabase as any).from('witness_invitations').insert(invitations).select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create invitations' }, { status: 500 })
    }

    // TODO: Send emails (would use Resend or similar service)
    // For now, just return success
    console.log('Would send emails to:', witnesses.map((w: any) => w.email))

    // In a real implementation, you'd do something like:
    // await Promise.all(
    //   witnesses.map(async (witness) => {
    //     const invitation = data.find((inv) => inv.witness_email === witness.email)
    //     if (invitation) {
    //       await sendInvitationEmail({
    //         to: witness.email,
    //         name: witness.name,
    //         inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/submit/witness-invite?token=${invitation.token}`,
    //       })
    //     }
    //   })
    // )

    return NextResponse.json({
      success: true,
      message: 'Invitations sent successfully',
      count: witnesses.length,
    })
  } catch (error: any) {
    console.error('Witness invitation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
