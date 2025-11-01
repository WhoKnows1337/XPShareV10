import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TimelineClient } from './timeline-client'

interface TimelinePageProps {
  searchParams: Promise<{
    category?: string
  }>
}

export default async function TimelinePage({ searchParams }: TimelinePageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const category = params.category || 'all'

  // Fetch initial experiences
  let query = supabase
    .from('experiences')
    .select(`
      id,
      title,
      story_text,
      category,
      tags,
      location_text,
      date_occurred,
      time_of_day,
      created_at,
      view_count,
      upvote_count,
      comment_count,
      user_profiles!experiences_user_id_fkey (
        username,
        display_name,
        avatar_url
      )
    `, { count: 'exact' })
    .eq('visibility', 'public')

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data: experiences, error, count } = await query
    .order('date_occurred', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(20)

  // Map experiences to handle null values
  const mappedExperiences = experiences?.map(exp => ({
    ...exp,
    story_text: exp.story_text ?? '',
    tags: exp.tags ?? [],
    location_text: exp.location_text ?? undefined,
    date_occurred: exp.date_occurred ?? undefined,
    time_of_day: exp.time_of_day ?? undefined,
    created_at: exp.created_at ?? new Date().toISOString(),
    view_count: exp.view_count ?? 0,
    upvote_count: exp.upvote_count ?? 0,
    comment_count: exp.comment_count ?? 0,
    user_profiles: exp.user_profiles ? {
      username: exp.user_profiles.username || 'user',
      display_name: exp.user_profiles.display_name || exp.user_profiles.username || 'user',
      avatar_url: exp.user_profiles.avatar_url ?? undefined
    } : undefined
  })) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <TimelineClient
        initialExperiences={mappedExperiences}
        initialCategory={category}
        totalCount={count || 0}
      />
    </div>
  )
}
