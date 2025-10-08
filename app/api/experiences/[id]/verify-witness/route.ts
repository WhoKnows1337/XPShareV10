import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface VerifyWitnessRequest {
  witness_user_id: string
  verification_text: string
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: experienceId } = await params

    // Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify user is the experience author
    const { data: experience } = await supabase
      .from('experiences')
      .select('user_id')
      .eq('id', experienceId)
      .single()

    if (!experience || experience.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the experience author can verify witnesses' },
        { status: 403 }
      )
    }

    const body: VerifyWitnessRequest = await req.json()
    const { witness_user_id, verification_text } = body

    if (!witness_user_id || !verification_text) {
      return NextResponse.json(
        { error: 'witness_user_id and verification_text are required' },
        { status: 400 }
      )
    }

    // 1. Create verification record
    const { error: verificationError } = await supabase
      .from('witness_verifications')
      .insert({
        experience_id: experienceId,
        author_user_id: user.id,
        witness_user_id,
        verification_comment: verification_text,
        status: 'verified',
        verified_at: new Date().toISOString(),
      })

    if (verificationError) {
      throw verificationError
    }

    // 2. Award Badge + XP
    // Check if badge exists
    const { data: badge } = await supabase
      .from('badges')
      .select('id')
      .eq('name', 'Verified Witness')
      .single()

    if (badge) {
      // Award badge if not already earned
      const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', witness_user_id)
        .eq('badge_id', badge.id)
        .single()

      if (!existingBadge) {
        await supabase.from('user_badges').insert({
          user_id: witness_user_id,
          badge_id: badge.id,
        })
      }
    }

    // Add XP
    const { data: witnessProfile } = await supabase
      .from('user_profiles')
      .select('total_xp, level')
      .eq('id', witness_user_id)
      .single()

    if (witnessProfile) {
      const newXP = (witnessProfile.total_xp || 0) + 20
      const newLevel = Math.floor(newXP / 1000) + 1

      await supabase
        .from('user_profiles')
        .update({
          total_xp: newXP,
          level: newLevel,
        })
        .eq('id', witness_user_id)
    }

    // 3. Create notification
    const { data: authorProfile } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    await supabase.from('notifications').insert({
      user_id: witness_user_id,
      type: 'witness_verified',
      title: '🎉 Deine Witness-Verifikation wurde bestätigt!',
      message: `@${authorProfile?.username} hat dich als Witness verifiziert!`,
      data: {
        experience_id: experienceId,
        badge: 'verified-witness',
        xp: 20,
      },
    })

    // 4. Create Neo4j relationship (if Neo4j is configured)
    // This would require Neo4j driver integration
    // For now, we'll skip this part as it requires additional setup

    return NextResponse.json({
      success: true,
      message: 'Witness verified successfully',
      xp_awarded: 20,
      badge_awarded: 'verified-witness',
    })
  } catch (error) {
    console.error('Witness verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify witness' },
      { status: 500 }
    )
  }
}
