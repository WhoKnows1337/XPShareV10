import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// GET /api/users/:id - Get user profile
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Get user badges
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select(`
        earned_at,
        badges (
          id,
          name,
          description,
          icon_name,
          rarity
        )
      `)
      .eq('user_id', id)
      .order('earned_at', { ascending: false })

    // Get recent experiences (first 5)
    const { data: recentExperiences } = await supabase
      .from('experiences')
      .select('id, title, category, created_at')
      .eq('user_id', id)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(5)

    // Get experience count
    const { count: experienceCount } = await supabase
      .from('experiences')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id)

    // Calculate level (every 100 XP = 1 level)
    const level = Math.floor((profile.total_xp || 0) / 100) + 1

    // Format response
    const response = {
      id: profile.id,
      username: profile.username,
      display_name: profile.display_name || profile.username,
      avatar_url: profile.avatar_url || null,
      bio: profile.bio || null,
      location_city: profile.location_city || null,
      location_country: profile.location_country || null,
      languages: profile.languages || ['de'],

      // Stats
      total_xp: profile.total_xp || 0,
      level,
      current_streak: profile.current_streak || 0,
      longest_streak: profile.longest_streak || 0,
      total_experiences: experienceCount || 0,
      total_contributions: profile.total_contributions || 0,

      // Badges
      badges: userBadges?.map((ub: any) => ({
        id: ub.badges.id,
        name: ub.badges.name,
        description: ub.badges.description,
        icon_name: ub.badges.icon_name,
        rarity: ub.badges.rarity,
        earned_at: ub.earned_at,
      })) || [],

      // Recent experiences
      recent_experiences: recentExperiences || [],

      created_at: profile.created_at,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

// PATCH /api/users/:id - Update user profile
const UpdateProfileSchema = z.object({
  display_name: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
  location_city: z.string().max(100).optional(),
  location_country: z.string().max(100).optional(),
  languages: z.array(z.string()).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  try {
    // Auth check
    const {
      data: { user },
    } = await (supabase as any).auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Only allow users to update their own profile
    if (user.id !== id) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validatedData = UpdateProfileSchema.parse(body)

    // Update profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      id: data.id,
      updated_at: data.updated_at,
      message: 'Profile updated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', code: 'VALIDATION_ERROR', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
