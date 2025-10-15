import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: experienceId } = await params

    // Authenticate
    const {
      data: { user },
    } = await (supabase as any).auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify user is the experience author
    const { data: experience } = await supabase
      .from('experiences')
      .select('user_id, title')
      .eq('id', experienceId)
      .single()

    if (!experience || experience.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the experience author can invite witnesses' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { method, email, username, message } = body

    if (method === 'email' && email) {
      // Email invitation
      if (!resend) {
        return NextResponse.json(
          { error: 'Email service not configured' },
          { status: 500 }
        )
      }

      const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/experiences/${experienceId}?invite=witness`

      await resend.emails.send({
        from: 'XPShare <noreply@xpshare.com>',
        to: email,
        subject: `You've been invited to share your perspective on "${experience.title}"`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You've been invited as a witness</h2>
            <p>You've been invited to add your perspective on an experience:</p>
            <blockquote style="border-left: 4px solid #8b5cf6; padding-left: 16px; margin: 20px 0;">
              <strong>${experience.title}</strong>
            </blockquote>
            ${message ? `<p style="font-style: italic; color: #666;">"${message}"</p>` : ''}
            <p>
              <a href="${inviteLink}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
                Add Your Perspective
              </a>
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you weren't expecting this invitation, you can safely ignore this email.
            </p>
          </div>
        `,
      })

      return NextResponse.json({
        success: true,
        message: 'Invitation email sent successfully',
      })
    } else if (method === 'username' && username) {
      // Username notification
      const { data: invitedUser } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', username)
        .single()

      if (!invitedUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Create notification
      await (supabase as any).from('notifications').insert({
        user_id: invitedUser.id,
        type: 'witness_invite',
        title: `You've been invited as a witness`,
        message: message || `You've been invited to add your perspective on "${experience.title}"`,
        data: {
          experience_id: experienceId,
          experience_title: experience.title,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Invitation notification sent successfully',
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid invitation method' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Invite witness error:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}
