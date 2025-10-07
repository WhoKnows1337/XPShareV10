import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FeedClient } from './feed-client'

interface FeedPageProps {
  searchParams: Promise<{
    category?: string
    sort?: string
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

  // Build query based on filters
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

  // Apply category filter
  if (params.category && params.category !== 'all') {
    query = query.eq('category', params.category)
  }

  // Apply sorting
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

  // Fetch experiences
  const { data: experiences, error } = await query.limit(20)

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
        experiences={experiences || []}
        trendingExperiences={trendingExperiences || []}
        category={params.category}
      />
    </div>
  )
}
