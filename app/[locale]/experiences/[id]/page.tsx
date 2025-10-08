import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ThreeColumnLayout } from '@/components/layout/three-column-layout'
import { ExperienceHeader } from '@/components/experience-detail/ExperienceHeader'
import { ExperienceContent } from '@/components/experience-detail/ExperienceContent'
import { RelatedSidebar } from '@/components/experience-detail/RelatedSidebar'
import { PatternSidebar } from '@/components/experience-detail/PatternSidebar'
import { MobileTabsLayout } from '@/components/experience-detail/MobileTabsLayout'
import { CommentsSection } from '@/components/interactions/comments-section'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch experience with related data
  const { data: experience, error } = await supabase
    .from('experiences')
    .select(`
      *,
      user_profiles!experiences_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .single()

  if (error || !experience) {
    notFound()
  }

  // Fetch author's level and XP
  const { data: authorProfile } = await supabase
    .from('user_profiles')
    .select('level, total_xp')
    .eq('id', experience.user_id!)
    .single()

  // Fetch author's top badges
  const { data: authorBadges } = await supabase
    .from('user_badges')
    .select(`
      earned_at,
      badges (
        slug,
        name,
        description,
        icon,
        rarity
      )
    `)
    .eq('user_id', experience.user_id!)
    .order('earned_at', { ascending: false })
    .limit(3)

  // Count author's total experiences
  const { count: totalExperiences } = await supabase
    .from('experiences')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', experience.user_id!)
    .eq('visibility', 'public')

  // Fetch similar experiences (for pattern detection)
  const { data: similarExperiences } = await supabase
    .from('experiences')
    .select(`
      id,
      title,
      category,
      created_at,
      user_profiles (
        username,
        display_name
      )
    `)
    .eq('category', experience.category)
    .neq('id', id)
    .limit(12)

  // Check if current user is following the author
  // TODO: Implement user_follows table and uncomment this code
  let isFollowing = false
  // if (user?.id && user.id !== experience.user_id) {
  //   const { data: followData } = await supabase
  //     .from('user_follows')
  //     .select('id')
  //     .eq('follower_id', user.id)
  //     .eq('following_id', experience.user_id!)
  //     .single()

  //   isFollowing = !!followData
  // }

  const profile = experience.user_profiles as any
  const isAuthor = user?.id === experience.user_id

  // Prepare user data for components
  const userData = {
    id: experience.user_id!,
    username: profile?.username || 'unknown',
    display_name: profile?.display_name,
    avatar_url: profile?.avatar_url,
    level: authorProfile?.level ?? undefined,
    total_xp: authorProfile?.total_xp ?? undefined,
    total_experiences: totalExperiences || 0,
    topBadges:
      authorBadges?.map((ub: any) => ({
        slug: ub.badges.slug,
        name: ub.badges.name,
        description: ub.badges.description,
        icon: ub.badges.icon,
        rarity: ub.badges.rarity,
      })) || [],
  }

  // Prepare similar experiences data
  const similarExpsData = similarExperiences?.map((exp: any) => ({
    id: exp.id,
    title: exp.title,
    category: exp.category,
    created_at: exp.created_at,
    user_profiles: exp.user_profiles,
    match_score: Math.floor(Math.random() * 30) + 70, // TODO: Replace with actual similarity algorithm
  })) || []

  // Prepare sidebar components
  const relatedSidebarContent = (
    <Suspense fallback={<SidebarSkeleton />}>
      <RelatedSidebar
        user={userData}
        similarExperiences={similarExpsData}
        currentUserId={user?.id}
        isFollowing={isFollowing}
      />
    </Suspense>
  )

  const patternSidebarContent = (
    <Suspense fallback={<SidebarSkeleton />}>
      <PatternSidebar
        experienceId={experience.id}
        category={experience.category}
        dateOccurred={experience.date_occurred ?? undefined}
        locationLat={experience.location_lat ?? undefined}
        locationLng={experience.location_lng ?? undefined}
        similarCount={similarExpsData.length}
        patternMatches={[
          // TODO: Replace with actual pattern detection
          {
            category: experience.category,
            count: similarExpsData.length,
            strength: 75,
            timeframe: 'Last 30 days',
          },
        ]}
        externalEvents={[
          // TODO: Replace with actual external events API
        ]}
      />
    </Suspense>
  )

  const mainContentArea = (
    <div className="space-y-8">
      {/* Main Experience Content */}
      <ExperienceContent
        id={experience.id}
        title={experience.title}
        storyText={experience.story_text || ''}
        category={experience.category}
        heroImageUrl={undefined}
        locationText={experience.location_text ?? undefined}
        locationLat={experience.location_lat ?? undefined}
        locationLng={experience.location_lng ?? undefined}
        dateOccurred={experience.date_occurred ?? undefined}
        timeOfDay={experience.time_of_day ?? undefined}
        tags={experience.tags || []}
        dynamicAnswers={[]}
        media={[]}
        sketches={[]}
        witnesses={[]}
        linkedExperiences={[]}
        isTranslated={false}
      />

      {/* Comments Section */}
      <Suspense
        fallback={
          <Card>
            <CardContent className="p-8">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        }
      >
        <CommentsSection experienceId={experience.id} currentUserId={user?.id} />
      </Suspense>
    </div>
  )

  return (
    <>
      {/* Sticky Header */}
      <ExperienceHeader
        id={experience.id}
        user={userData}
        category={experience.category}
        occurredAt={experience.date_occurred ?? undefined}
        viewCount={experience.view_count || 0}
        likeCount={experience.upvote_count || 0}
        commentCount={experience.comment_count || 0}
        isAuthor={isAuthor}
        currentUserId={user?.id}
      />

      {/* Desktop: Three-Column Layout */}
      <div className="hidden lg:block">
        <ThreeColumnLayout
          leftSidebar={relatedSidebarContent}
          mainContent={mainContentArea}
          rightPanel={patternSidebarContent}
        />
      </div>

      {/* Mobile: Tabs Layout */}
      <MobileTabsLayout
        mainContent={mainContentArea}
        relatedSidebar={relatedSidebarContent}
        patternSidebar={patternSidebarContent}
      />
    </>
  )
}

function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-20 w-20 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>
  )
}
