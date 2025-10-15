import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await (supabase as any).auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { badgeId } = await request.json()

    if (!badgeId) {
      return NextResponse.json({ error: 'Badge ID is required' }, { status: 400 })
    }

    // Check if user already has this badge
    const { data: existingBadge } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', user.id)
      .eq('badge_id', badgeId)
      .single()

    if (existingBadge) {
      return NextResponse.json({
        success: false,
        message: 'Badge already awarded'
      }, { status: 200 })
    }

    // Get badge details for XP amount
    const { data: badge, error: badgeError } = await (supabase as any)
      .from('badges')
      .select('name, description, xp_reward, icon')
      .eq('id', badgeId)
      .single()

    if (badgeError || !badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 })
    }

    // Award the badge
    const { data: userBadge, error: awardError } = await supabase
      .from('user_badges')
      .insert({
        user_id: user.id,
        badge_id: badgeId,
        earned_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (awardError) {
      console.error('Error awarding badge:', awardError)
      return NextResponse.json({ error: 'Failed to award badge' }, { status: 500 })
    }

    // Update user's total XP
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('total_xp')
      .eq('user_id', user.id)
      .single()

    const currentXP = profile?.total_xp || 0
    const newTotalXP = currentXP + badge.xp_reward

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ total_xp: newTotalXP })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating XP:', updateError)
    }

    // Create notification
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'badge_earned',
        title: `Badge Earned: ${badge.name}!`,
        message: `You earned the "${badge.name}" badge and gained ${badge.xp_reward} XP!`,
        data: {
          badge_id: badgeId,
          badge_name: badge.name,
          xp_reward: badge.xp_reward,
        },
        read: false,
      })

    if (notificationError) {
      console.error('Error creating notification:', notificationError)
    }

    return NextResponse.json({
      success: true,
      badge,
      userBadge,
      xpGained: badge.xp_reward,
      totalXP: newTotalXP,
    }, { status: 200 })
  } catch (error) {
    console.error('Badge awarding error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
