import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await (supabase as any).auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    // Get current user's profile and experiences
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('id, username')
      .eq('user_id', user.id)
      .single()

    if (!currentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get current user's experiences to analyze categories and location
    const { data: currentUserExperiences } = await supabase
      .from('experiences')
      .select('category, location_text')
      .eq('user_id', user.id)

    if (!currentUserExperiences || currentUserExperiences.length === 0) {
      return NextResponse.json({ users: [] }, { status: 200 })
    }

    // Extract categories and location from current user's experiences
    const currentCategories = [...new Set(currentUserExperiences.map(e => e.category).filter(Boolean))]
    const currentLocations = currentUserExperiences
      .map(e => e.location_text)
      .filter(Boolean)
      .map(loc => loc?.split(',')[0]?.trim()) // Get city/region only

    const mostCommonLocation = currentLocations.length > 0
      ? currentLocations.sort((a, b) =>
          currentLocations.filter(v => v === a).length - currentLocations.filter(v => v === b).length
        ).pop()
      : null

    // Get all other users with their experiences
    const { data: otherUsers } = await (supabase as any)
      .from('user_profiles')
      .select(`
        id,
        user_id,
        username,
        display_name,
        avatar_url
      `)
      .neq('user_id', user.id)
      .limit(100)

    if (!otherUsers || otherUsers.length === 0) {
      return NextResponse.json({ users: [] }, { status: 200 })
    }

    // Calculate similarity for each user
    const similarityScores = await Promise.all(
      otherUsers.map(async (otherUser: any) => {
        // Get other user's experiences
        const { data: otherUserExperiences } = await supabase
          .from('experiences')
          .select('category, location_text')
          .eq('user_id', otherUser.user_id)

        if (!otherUserExperiences || otherUserExperiences.length === 0) {
          return null
        }

        const otherCategories = [...new Set(otherUserExperiences.map(e => e.category).filter(Boolean))]
        const otherLocations = otherUserExperiences
          .map(e => e.location_text)
          .filter(Boolean)
          .map(loc => loc?.split(',')[0]?.trim())

        // Calculate common categories
        const commonCategories = currentCategories.filter(cat => otherCategories.includes(cat))

        // Check for common location
        const hasCommonLocation = mostCommonLocation && otherLocations.includes(mostCommonLocation)

        // Count similar experiences (same category)
        const commonExperiencesCount = currentUserExperiences.filter(ce =>
          otherUserExperiences.some(oe => oe.category === ce.category)
        ).length

        // Calculate similarity score (0-100)
        const categoryScore = (commonCategories.length / Math.max(currentCategories.length, otherCategories.length)) * 60
        const locationScore = hasCommonLocation ? 20 : 0
        const experienceScore = (commonExperiencesCount / Math.max(currentUserExperiences.length, otherUserExperiences.length)) * 20

        const similarityScore = categoryScore + locationScore + experienceScore

        return {
          user_id: otherUser.user_id,
          username: otherUser.username,
          display_name: otherUser.display_name,
          avatar_url: otherUser.avatar_url,
          similarity_score: similarityScore,
          common_categories: commonCategories,
          common_location: hasCommonLocation ? mostCommonLocation : undefined,
          common_experiences_count: commonExperiencesCount,
        }
      })
    )

    // Filter out null values and users with similarity < 20%
    const validSimilarUsers = similarityScores
      .filter((user): user is NonNullable<typeof user> => user !== null && user.similarity_score >= 20)
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, limit)

    return NextResponse.json({ users: validSimilarUsers }, { status: 200 })
  } catch (error) {
    console.error('Similar users API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
