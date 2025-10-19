import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ProfileClientTabs } from './profile-client-tabs'

interface ProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  // Fetch profile data directly from database
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Get user badges with full badge data
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select(`
      earned_at,
      badges (
        id,
        name,
        description,
        icon,
        rarity,
        xp_reward
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

  // Get category distribution for XP DNA Badge
  const { data: categoryData } = await supabase
    .from('experiences')
    .select('category')
    .eq('user_id', id)
    .eq('visibility', 'public')

  // Calculate category distribution
  const categoryDistribution: Record<string, number> = {}
  categoryData?.forEach((exp: any) => {
    if (exp.category) {
      categoryDistribution[exp.category] = (categoryDistribution[exp.category] || 0) + 1
    }
  })

  // Get top 3 categories
  const topCategories = Object.entries(categoryDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat)

  // Calculate level
  const level = Math.floor((profile.total_xp || 0) / 100) + 1

  // Format profile data
  const profileData = {
    id: profile.id,
    username: profile.username,
    display_name: profile.display_name || profile.username,
    avatar_url: profile.avatar_url || null,
    bio: profile.bio || null,
    location_city: profile.location_city || null,
    location_country: profile.location_country || null,
    total_xp: profile.total_xp || 0,
    level,
    current_streak: profile.current_streak || 0,
    longest_streak: profile.longest_streak || 0,
    total_experiences: experienceCount || 0,
    total_contributions: profile.total_contributions || 0,
    badges: userBadges?.map((ub: any) => ({
      id: ub.badges.id,
      name: ub.badges.name,
      description: ub.badges.description,
      icon_name: ub.badges.icon_name,
      rarity: ub.badges.rarity,
      earned_at: ub.earned_at,
    })) || [],
    recent_experiences: recentExperiences || [],
    created_at: profile.created_at,
  }

  const isOwnProfile = currentUser?.id === id

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get drafts and private counts for own profile
  let draftsCount = 0
  let privateCount = 0
  if (isOwnProfile) {
    const [{ count: drafts }, { count: privateExp }] = await Promise.all([
      supabase
        .from('experiences')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', id)
        .eq('visibility', 'draft'),
      supabase
        .from('experiences')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', id)
        .eq('visibility', 'private')
    ])
    draftsCount = drafts || 0
    privateCount = privateExp || 0
  }

  const stats = {
    experiencesCount: experienceCount || 0,
    draftsCount,
    privateCount
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <ProfileClientTabs
        profileUser={profile}
        currentUserId={currentUser?.id || ''}
        stats={stats}
        experiences={recentExperiences || []}
        badges={userBadges || []}
        isOwnProfile={isOwnProfile}
        totalXP={profileData.total_xp}
        level={profileData.level}
        currentStreak={profileData.current_streak}
        longestStreak={profileData.longest_streak}
        totalContributions={profileData.total_contributions}
        topCategories={topCategories}
        categoryDistribution={categoryDistribution}
      />
    </div>
  )
}
