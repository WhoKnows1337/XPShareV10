import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Badge IDs from database
const BADGES = {
  FIRST_STEPS: '9346a04c-b978-4488-8cad-047e66abc4c4',
  STORYTELLER: '70cb7e2a-2fa1-40e6-8525-2081decde262',
  CHRONICLER: 'd59be391-06ad-4708-ade8-e4c5a382715e',
  PATTERN_FINDER: 'e61def7d-ec00-47a0-9c05-0d7d7f4c0a3d',
  NOT_ALONE: '375b13e9-89c5-4f0c-beb1-a063ccc85674',
  EARLY_ADOPTER: 'cfa3bb40-24c8-4cf3-88e8-c9e708e30ab4',
  NIGHT_OWL: 'fdfc65c2-0681-4b51-abff-f081088b666f',
  DREAM_WALKER: 'dfd3d53f-1a34-4dc7-819f-fd0ded9b3c02',
  UFO_WATCHER: '90d20dc3-a1e8-4694-9988-04f68380573f',
  SPIRITUAL_GUIDE: '0ecbaa4a-ee68-4551-b0ba-516434eae6e5',
}

async function awardBadge(supabase: any, userId: string, badgeId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/gamification/award-badge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ badgeId }),
  })
  return response.json()
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, category, timeOfDay } = await request.json()

    const earnedBadges: any[] = []

    // Check First Steps badge (first experience)
    if (action === 'experience_submitted') {
      const { data: experiences } = await supabase
        .from('experiences')
        .select('id')
        .eq('user_id', user.id)

      if (experiences?.length === 1) {
        const result = await awardBadge(supabase, user.id, BADGES.FIRST_STEPS)
        if (result.success) earnedBadges.push(result.badge)
      }

      // Check Storyteller (5 experiences)
      if (experiences?.length === 5) {
        const result = await awardBadge(supabase, user.id, BADGES.STORYTELLER)
        if (result.success) earnedBadges.push(result.badge)
      }

      // Check Chronicler (10 experiences)
      if (experiences?.length === 10) {
        const result = await awardBadge(supabase, user.id, BADGES.CHRONICLER)
        if (result.success) earnedBadges.push(result.badge)
      }

      // Check Night Owl (submit at night)
      if (timeOfDay === 'night' || timeOfDay === 'late_night') {
        const result = await awardBadge(supabase, user.id, BADGES.NIGHT_OWL)
        if (result.success) earnedBadges.push(result.badge)
      }

      // Check category-specific badges (3 experiences each)
      const { data: categoryExperiences } = await supabase
        .from('experiences')
        .select('id')
        .eq('user_id', user.id)
        .eq('category', category)

      if (categoryExperiences?.length === 3) {
        if (category === 'dreams') {
          const result = await awardBadge(supabase, user.id, BADGES.DREAM_WALKER)
          if (result.success) earnedBadges.push(result.badge)
        } else if (category === 'ufo') {
          const result = await awardBadge(supabase, user.id, BADGES.UFO_WATCHER)
          if (result.success) earnedBadges.push(result.badge)
        } else if (category === 'spiritual') {
          const result = await awardBadge(supabase, user.id, BADGES.SPIRITUAL_GUIDE)
          if (result.success) earnedBadges.push(result.badge)
        }
      }
    }

    return NextResponse.json({
      success: true,
      earnedBadges,
      count: earnedBadges.length,
    }, { status: 200 })
  } catch (error) {
    console.error('Badge checking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
