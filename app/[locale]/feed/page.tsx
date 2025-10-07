import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FeedClient } from './feed-client'

interface FeedPageProps {
  searchParams: Promise<{
    category?: string
    sort?: string
    tab?: string
    radius?: string
    dateRange?: string
  }>
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('username, display_name')
    .eq('id', user.id)
    .single()

  // Await searchParams
  const params = await searchParams
  const currentTab = params.tab || 'for-you'

  // Build query based on filters and tab
  let query = supabase
    .from('experiences')
    .select(`
      *,
      user_profiles!experiences_user_id_fkey (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('visibility', 'public')

  // Apply tab-specific filters
  switch (currentTab) {
    case 'following':
      // Get users that current user follows
      const { data: followedUsers } = await supabase
        .from('user_follows')
        .select('followed_user_id')
        .eq('follower_user_id', user.id)

      if (followedUsers && followedUsers.length > 0) {
        const followedUserIds = followedUsers.map(f => f.followed_user_id)
        query = query.in('user_id', followedUserIds)
      } else {
        // No followed users, return empty array
        query = query.eq('id', '00000000-0000-0000-0000-000000000000') // Non-existent ID
      }
      break

    case 'trending':
      // Calculate engagement score: (upvotes * 2) + (comments * 3) + (views * 0.1)
      // Order by engagement score (simulated with upvote_count for now)
      query = query.order('upvote_count', { ascending: false })
      break

    case 'achievements':
      // For achievements tab, we'll fetch from notifications/badges instead
      // For now, skip experiences query
      break

    case 'for-you':
    default:
      // AI-personalized feed with hybrid algorithm
      // Fetched via RPC function get_for_you_feed
      break
  }

  // Apply category filter (all tabs except achievements)
  if (currentTab !== 'achievements' && params.category && params.category !== 'all') {
    query = query.eq('category', params.category)
  }

  // Apply date range filter
  if (currentTab !== 'achievements' && params.dateRange) {
    const now = new Date()
    let dateFrom: Date | null = null

    switch (params.dateRange) {
      case '24h':
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom.toISOString())
    }
  }

  // Apply radius filter (location proximity)
  // Note: This is a simplified version. For real proximity search, use PostGIS
  if (currentTab !== 'achievements' && params.radius && user) {
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('location_text, city')
      .eq('user_id', user.id)
      .single()

    if (userProfile?.location_text || userProfile?.city) {
      const userLocation = userProfile.location_text || userProfile.city
      // Simple text-based proximity filter
      // In production, use PostGIS for proper distance calculation
      query = query.ilike('location_text', `%${userLocation}%`)
    }
  }

  // Apply sorting (unless tab overrides it)
  if (currentTab !== 'trending') {
    const sort = params.sort || 'latest'
    switch (sort) {
      case 'popular':
        query = query.order('upvote_count', { ascending: false })
        break
      case 'views':
        query = query.order('view_count', { ascending: false })
        break
      case 'latest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }
  }

  // Fetch experiences (skip for achievements tab)
  let experiences = []
  if (currentTab !== 'achievements') {
    if (currentTab === 'for-you') {
      // Try AI-powered For You feed, fallback to smart filtering if RPC doesn't exist
      try {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('location_text, city, country')
          .eq('user_id', user.id)
          .single()

        // Get user's liked categories
        const { data: upvotes } = await supabase
          .from('upvotes')
          .select('experiences(category)')
          .eq('user_id', user.id)

        const likedCategories = [...new Set(
          upvotes?.map((u: any) => u.experiences?.category).filter(Boolean) || []
        )]

        // Try to use RPC function if it exists
        const { data, error } = await supabase.rpc('get_for_you_feed', {
          p_user_id: user.id,
          p_liked_categories: likedCategories,
          p_user_location: userProfile?.location_text || userProfile?.city || null,
          p_limit: 20,
          p_offset: 0
        })

        if (!error && data) {
          experiences = data
        } else {
          throw new Error('RPC function not available')
        }
      } catch (error) {
        // Fallback: Smart filtering based on user preferences
        console.log('Using fallback For You algorithm')

        // Get user's liked categories
        const { data: upvotes } = await supabase
          .from('upvotes')
          .select('experiences(category)')
          .eq('user_id', user.id)

        const likedCategories = [...new Set(
          upvotes?.map((u: any) => u.experiences?.category).filter(Boolean) || []
        )]

        // Build smart query
        let smartQuery = query

        // If user has liked categories, prioritize those
        if (likedCategories.length > 0) {
          smartQuery = smartQuery.in('category', likedCategories)
        }

        // Get recent experiences
        smartQuery = smartQuery.order('created_at', { ascending: false })

        const fallback = await smartQuery.limit(20)
        experiences = fallback.data || []
      }
    } else {
      const { data, error } = await query.limit(20)
      experiences = data || []
    }
  }

  // Fetch trending experiences for right panel
  const { data: trendingExperiences } = await supabase
    .from('experiences')
    .select('id, title, category, upvote_count, comment_count, view_count')
    .eq('visibility', 'public')
    .order('upvote_count', { ascending: false })
    .limit(3)

  const userName = profile?.display_name || profile?.username || 'User'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <FeedClient
        userName={userName}
        currentUserId={user.id}
        experiences={experiences}
        trendingExperiences={trendingExperiences || []}
        category={params.category}
      />
    </div>
  )
}
