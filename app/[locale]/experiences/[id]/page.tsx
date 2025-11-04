import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { ThreeColumnLayout } from '@/components/layout/three-column-layout'
import { ExperienceHeader } from '@/components/experience-detail/ExperienceHeader'
import { ExperienceContent } from '@/components/experience-detail/ExperienceContent'
import { RelatedSidebar } from '@/components/experience-detail/RelatedSidebar'
import { PatternSidebar } from '@/components/experience-detail/PatternSidebar'
import { MobileTabsLayout } from '@/components/experience-detail/MobileTabsLayout'
import { AnimatedPageWrapper, AnimatedSection } from '@/components/experience-detail/AnimatedPageWrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getSimilarExperiences,
  getEnvironmentalData,
  getCrossCategoryInsights,
  getNearbyExperiences,
} from '@/lib/api/experiences'
import { getImageBlurDataURL } from '@/lib/utils/image-blur'
import type { Database } from '@/lib/supabase/database.types'

type ExperienceWithProfile = Database['public']['Tables']['experiences']['Row'] & {
  user_profiles: {
    id: string
    username: string | null
    display_name: string | null
    avatar_url: string | null
  } | null
}

// Dynamic imports for heavy components
const CommentsSection = dynamic(
  () => import('@/components/interactions/comments-section').then((mod) => ({ default: mod.CommentsSection })),
  {
    loading: () => (
      <Card>
        <CardContent className="p-8">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    ),
  }
)

const CrossCategoryInsights = dynamic(
  () => import('@/components/experience-detail/CrossCategoryInsights').then((mod) => ({ default: mod.CrossCategoryInsights })),
  {
    loading: () => <Skeleton className="h-32 w-full" />,
  }
)

const MapboxMiniMap = dynamic(
  () => import('@/components/experience-detail/MapboxMiniMap').then((mod) => ({ default: mod.MapboxMiniMap })),
  {
    loading: () => <Skeleton className="aspect-square w-full" />,
  }
)

const GraphVisualization = dynamic(
  () => import('@/components/experience-detail/GraphVisualization').then((mod) => ({ default: mod.GraphVisualization })),
  {
    loading: () => <Skeleton className="aspect-square w-full" />,
  }
)

const LiveRegion = dynamic(
  () => import('@/components/accessibility/LiveRegion').then((mod) => ({ default: mod.LiveRegion }))
)

const categoryLabels: Record<string, string> = {
  ufo: 'UFO Sighting',
  paranormal: 'Paranormal',
  dreams: 'Dream Experience',
  psychedelic: 'Psychedelic',
  spiritual: 'Spiritual',
  synchronicity: 'Synchronicity',
  nde: 'Near-Death Experience',
  other: 'Other Experience',
}

// ISR: Cache for 1 hour, then revalidate (Spec Lines 1429-1433)
export const revalidate = 3600

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const supabase = await createClient()
  const { id } = await params

  interface ExperienceMetadata {
    id: string
    title: string
    story_text: string | null
    category: string
    date_occurred: string | null
    location_text: string | null
    tags: string[] | null
    user_profiles: {
      username: string | null
      display_name: string | null
    } | null
  }

  const { data: experienceRaw } = (await supabase
    .from('experiences')
    .select(`
      id,
      title,
      story_text,
      category,
      date_occurred,
      location_text,
      tags,
      user_profiles!experiences_user_id_fkey (
        username,
        display_name
      )
    `)
    .eq('id', id)
    .single()) as { data: ExperienceMetadata | null; error: any }

  const experience: ExperienceMetadata | null = experienceRaw

  if (!experience) {
    return {
      title: 'Experience Not Found',
    }
  }

  // Type guard to ensure TypeScript knows this is ExperienceMetadata
  const exp: ExperienceMetadata = experience
  const profile = experience.user_profiles
  const authorName = profile?.display_name || profile?.username || 'Anonymous'
  const categoryLabel = categoryLabels[experience.category] || experience.category
  const description = experience.story_text
    ? experience.story_text.substring(0, 155) + '...'
    : `A ${categoryLabel.toLowerCase()} experience shared by ${authorName}`

  const title = `${experience.title} - ${categoryLabel} | XPShare`

  return {
    title,
    description,
    keywords: [
      experience.category,
      categoryLabel,
      ...(experience.tags || []),
      'experience sharing',
      'anomalous phenomena',
    ].join(', '),
    authors: [{ name: authorName }],
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: experience.date_occurred || undefined,
      authors: [authorName],
      tags: experience.tags || [],
      locale: 'de_DE',
      siteName: 'XPShare',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/experiences/${id}`,
    },
  }
}

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
  const { data: experience, error } = (await supabase
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
    .single()) as { data: ExperienceWithProfile | null; error: any }

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
        id,
        name,
        description,
        icon_name,
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

  // Fetch similar experiences using vector similarity
  const similarExperiences = await getSimilarExperiences(id, 12)

  // Fetch external events (Solar, Moon, Weather)
  const externalEvents = await getEnvironmentalData(
    experience.date_occurred || '',
    experience.location_lat ?? undefined,
    experience.location_lng ?? undefined
  )

  // Fetch cross-category insights (Aha-Moment #9)
  const crossCategoryInsightsRaw = await getCrossCategoryInsights(experience.category)
  const crossCategoryInsights = Array.isArray(crossCategoryInsightsRaw) ? crossCategoryInsightsRaw : []

  // Fetch nearby experiences if location is available
  let nearbyCount = 0
  if (experience.location_lat && experience.location_lng) {
    const nearbyExperiences = await getNearbyExperiences(
      experience.location_lat,
      experience.location_lng,
      50, // 50km radius
      20 // limit
    )
    nearbyCount = Array.isArray(nearbyExperiences) ? nearbyExperiences.length : 0
  }

  // Fetch author's experiences for timeline
  const { data: authorExperiencesRaw } = await supabase
    .from('experiences')
    .select('created_at, date_occurred')
    .eq('user_id', experience.user_id!)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(50)

  const authorExperiences: { created_at: string | null; date_occurred: string | null }[] | null = authorExperiencesRaw

  // Fetch dynamic Q&A answers
  const { data: dynamicAnswersRaw } = await supabase
    .from('experience_answers')
    .select(`
      id,
      answer_value,
      dynamic_questions (
        id,
        question_text,
        question_type,
        options
      )
    `)
    .eq('experience_id', id)

  interface DynamicAnswer {
    id: string
    answer_value: unknown
    dynamic_questions: {
      id: string
      question_text: string
      question_type: string
      options: unknown
    }
  }

  const dynamicAnswers: DynamicAnswer[] | null = dynamicAnswersRaw

  // Fetch media
  const { data: mediaItemsRaw } = await supabase
    .from('experience_media')
    .select('*')
    .eq('experience_id', id)
    .order('sort_order', { ascending: true })

  interface MediaItem {
    id: string
    url: string
    type: string
    caption: string | null
    [key: string]: unknown
  }

  const mediaItems: MediaItem[] | null = mediaItemsRaw

  // Get hero image (first image) for blur placeholder
  const heroImage = mediaItems?.find((item) => item.type === 'photo' || item.type === 'image')
  let heroImageBlur = ''
  if (heroImage?.url) {
    try {
      heroImageBlur = await getImageBlurDataURL(heroImage.url)
    } catch (error) {
      console.error('Failed to generate blur placeholder:', error)
    }
  }

  // Fetch witnesses
  const { data: witnessesRaw } = await supabase
    .from('experience_witnesses')
    .select('*')
    .eq('experience_id', id)

  interface Witness {
    id: string
    name: string
    is_verified: boolean | null
    testimony: string | null
    [key: string]: unknown
  }

  const witnesses: Witness[] | null = witnessesRaw

  // Fetch external links
  const { data: externalLinksRaw } = await supabase
    .from('experience_external_links')
    .select('*')
    .eq('experience_id', id)
    .order('created_at', { ascending: true })

  interface ExternalLink {
    id: string
    url: string
    platform: string | null
    title: string | null
    description: string | null
    thumbnail_url: string | null
    author_name: string | null
    author_url: string | null
    provider_name: string | null
    provider_url: string | null
    html: string | null
    width: number | null
    height: number | null
    duration: number | null
    [key: string]: unknown
  }

  const externalLinks: ExternalLink[] | null = externalLinksRaw

  // Fetch linked experiences
  const { data: linkedExpsRaw } = await supabase
    .from('experience_links')
    .select(`
      linked_experience_id,
      experiences!experience_links_linked_experience_id_fkey (
        id,
        title,
        category,
        user_profiles (
          username,
          display_name,
          avatar_url
        )
      )
    `)
    .eq('source_experience_id', id)

  interface LinkedExperience {
    linked_experience_id: string
    experiences: {
      id: string
      title: string
      category: string
      user_profiles: {
        username: string | null
        display_name: string | null
        avatar_url: string | null
      } | null
    }
  }

  const linkedExps: LinkedExperience[] | null = linkedExpsRaw

  // Check if current user has liked this experience
  let isLiked = false
  if (user?.id) {
    const { data: likeData } = await supabase
      .from('upvotes')
      .select('id')
      .eq('experience_id', id)
      .eq('user_id', user.id)
      .single()

    isLiked = !!likeData
  }

  // Check if current user is following the author
  let isFollowing = false
  if (user?.id && user.id !== experience.user_id) {
    const { data: followData } = await (supabase.rpc as any)('is_following', {
      p_follower_id: user.id,
      p_following_id: experience.user_id,
    })

    isFollowing = !!followData
  }

  interface UserProfileInfo {
    id: string
    username: string | null
    display_name: string | null
    avatar_url: string | null
  }

  const profile: UserProfileInfo | null = experience.user_profiles as UserProfileInfo | null
  const isAuthor = user?.id === experience.user_id

  // Prepare user data for components
  const userData = {
    id: experience.user_id!,
    username: profile?.username || 'unknown',
    display_name: profile?.display_name ?? undefined,
    avatar_url: profile?.avatar_url ?? undefined,
    level: (authorProfile as { level: number | null; total_xp: number | null } | null)?.level ?? undefined,
    total_xp: (authorProfile as { level: number | null; total_xp: number | null } | null)?.total_xp ?? undefined,
    total_experiences: totalExperiences || 0,
    topBadges:
      authorBadges?.filter(ub => ub.badges !== null).map((ub) => ({
        slug: ub.badges!.id, // Using id as slug
        name: ub.badges!.name,
        description: ub.badges!.description || '',
        icon: ub.badges!.icon_name || '',
        rarity: ub.badges!.rarity || 'common',
      })) || [],
  }

  // Prepare similar experiences data (now with real similarity scores)
  const similarExpsData = Array.isArray(similarExperiences) ? similarExperiences : []

  // Prepare sidebar components
  const relatedSidebarContent = (
    <Suspense fallback={<SidebarSkeleton />}>
      <RelatedSidebar
        user={userData}
        similarExperiences={similarExpsData}
        currentUserId={user?.id}
        isFollowing={isFollowing}
        authorTimeline={(authorExperiences || [])
          .filter((exp) => experience.created_at !== null)
          .map((exp) => ({
            created_at: experience.created_at!,
            date_occurred: experience.date_occurred ?? undefined,
          }))}
        experienceId={experience.id}
      />
    </Suspense>
  )

  const patternSidebarContent = (
    <Suspense fallback={<SidebarSkeleton />}>
      <div className="space-y-6">
        <PatternSidebar
          experienceId={experience.id}
          category={experience.category}
          dateOccurred={experience.date_occurred ?? undefined}
          locationLat={experience.location_lat ?? undefined}
          locationLng={experience.location_lng ?? undefined}
          locationText={experience.location_text ?? undefined}
          similarCount={similarExpsData.length}
          patternMatches={[
            {
              category: experience.category,
              count: similarExpsData.length,
              strength: similarExpsData.length > 10 ? 85 : similarExpsData.length > 5 ? 65 : 45,
              timeframe: 'Last 30 days',
            },
          ]}
          externalEvents={externalEvents}
        />
        <CrossCategoryInsights
          insights={crossCategoryInsights}
          currentCategory={experience.category}
        />
        {experience.location_lat && experience.location_lng && (
          <MapboxMiniMap
            lat={experience.location_lat}
            lng={experience.location_lng}
            locationText={experience.location_text ?? undefined}
            nearbyCount={nearbyCount}
          />
        )}
      </div>
    </Suspense>
  )

  // Transform data for ExperienceContent
  const formattedDynamicAnswers = (dynamicAnswers || []).map((answer) => ({
    question_id: answer.dynamic_questions.id,
    question_text: answer.dynamic_questions.question_text,
    answer_type: answer.dynamic_questions.question_type as 'text' | 'chips' | 'slider',
    answer_value: answer.answer_value as string | number | string[],
    options: answer.dynamic_questions.options as string[] | undefined,
  }))

  // Group media by type for tabs
  const formattedPhotos = (mediaItems || [])
    .filter((item) => item.type === 'photo' || item.type === 'image' || item.type === 'sketch')
    .map((item) => ({
      id: item.id,
      url: item.url,
      type: item.type,
      caption: item.caption ?? undefined,
      isSketch: item.type === 'sketch',
    }))

  const formattedVideos = (mediaItems || [])
    .filter((item) => item.type === 'video')
    .map((item) => ({
      id: item.id,
      url: item.url,
      type: item.type,
      caption: item.caption ?? undefined,
      duration: (item as any).duration_seconds ?? undefined,
    }))

  const formattedAudio = (mediaItems || [])
    .filter((item) => item.type === 'audio')
    .map((item) => ({
      id: item.id,
      url: item.url,
      type: item.type,
      caption: item.caption ?? undefined,
      duration: (item as any).duration_seconds ?? undefined,
    }))

  const formattedDocuments = (mediaItems || [])
    .filter((item) => item.type === 'document' || item.type === 'pdf')
    .map((item) => ({
      id: item.id,
      url: item.url,
      type: item.type,
      caption: item.caption ?? undefined,
      fileName: (item as any).file_name ?? 'Document', // ✅ Use file_name instead of mime_type
      fileSize: (item as any).file_size ?? undefined,
    }))

  const formattedLinks = (externalLinks || []).map((link) => ({
    id: link.id,
    url: link.url,
    platform: link.platform ?? undefined,
    title: link.title ?? undefined,
    description: link.description ?? undefined,
    thumbnailUrl: link.thumbnail_url ?? undefined,
    authorName: link.author_name ?? undefined,
    authorUrl: link.author_url ?? undefined,
    providerName: link.provider_name ?? undefined,
    providerUrl: link.provider_url ?? undefined,
    html: link.html ?? undefined,
    width: link.width ?? undefined,
    height: link.height ?? undefined,
    duration: link.duration ?? undefined,
  }))

  // Keep backwards compatibility for old components (will be replaced by tabs)
  const formattedMedia = formattedPhotos.map((item) => ({
    id: item.id,
    url: item.url,
    type: 'image' as const,
    caption: item.caption,
  }))

  const formattedSketches = formattedPhotos
    .filter((item) => item.isSketch)
    .map((item) => item.url)

  const formattedWitnesses = (witnesses || []).map((w) => ({
    id: w.id,
    name: w.name,
    is_verified: w.is_verified ?? false,
    testimony: w.testimony ?? undefined,
  }))

  const formattedLinkedExperiences = (linkedExps || []).map((link) => ({
    id: link.experiences.id,
    title: link.experiences.title,
    category: link.experiences.category,
    user_profiles: link.experiences.user_profiles ? {
      username: link.experiences.user_profiles.username || 'unknown',
      display_name: link.experiences.user_profiles.display_name ?? undefined,
      avatar_url: link.experiences.user_profiles.avatar_url ?? undefined,
    } : undefined,
  }))

  const mainContentArea = (
    <div className="space-y-8" id="main-content">
      {/* Main Experience Content */}
      <ExperienceContent
        id={experience.id}
        title={experience.title}
        storyText={experience.story_text || ''}
        category={experience.category}
        heroImageUrl={heroImage?.url}
        heroImageBlur={heroImageBlur}
        locationText={experience.location_text ?? undefined}
        locationLat={experience.location_lat ?? undefined}
        locationLng={experience.location_lng ?? undefined}
        dateOccurred={experience.date_occurred ?? undefined}
        timeOfDay={experience.time_of_day ?? undefined}
        tags={experience.tags || []}
        dynamicAnswers={formattedDynamicAnswers}
        media={formattedMedia}
        sketches={formattedSketches}
        witnesses={formattedWitnesses}
        linkedExperiences={formattedLinkedExperiences}
        isTranslated={false}
        isAuthor={isAuthor}
        // NEW: Grouped media for tabs
        photos={formattedPhotos}
        videos={formattedVideos}
        audio={formattedAudio}
        documents={formattedDocuments}
        externalLinks={formattedLinks}
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

  // JSON-LD Structured Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: experience.title,
    description: experience.story_text?.substring(0, 200),
    author: {
      '@type': 'Person',
      name: userData.display_name || userData.username,
    },
    datePublished: experience.date_occurred || experience.created_at,
    dateModified: experience.updated_at,
    publisher: {
      '@type': 'Organization',
      name: 'XPShare',
      logo: {
        '@type': 'ImageObject',
        url: 'https://xpshare.com/logo.png',
      },
    },
    keywords: experience.tags?.join(', '),
    articleSection: categoryLabels[experience.category] || experience.category,
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ViewAction',
        userInteractionCount: experience.view_count || 0,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: experience.upvote_count || 0,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: experience.comment_count || 0,
      },
    ],
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Live Region for Screen Reader Announcements */}
      <LiveRegion experienceId={experience.id} />

      {/* Skip to Content Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Animated Page Wrapper (Spec: Lines 1043-1077) */}
      <AnimatedPageWrapper>
        {/* Sticky Header */}
        <AnimatedSection>
          <ExperienceHeader
            id={experience.id}
            title={experience.title}
            user={userData}
            category={experience.category}
            occurredAt={experience.date_occurred ?? undefined}
            viewCount={experience.view_count || 0}
            likeCount={experience.upvote_count || 0}
            commentCount={experience.comment_count || 0}
            isAuthor={isAuthor}
            currentUserId={user?.id}
            initialIsLiked={isLiked}
          />
        </AnimatedSection>

        {/* Desktop: Three-Column Layout */}
        <AnimatedSection className="hidden lg:block">
          <ThreeColumnLayout
            leftSidebar={relatedSidebarContent}
            mainContent={mainContentArea}
            rightPanel={patternSidebarContent}
          />
        </AnimatedSection>

        {/* Mobile: Tabs Layout */}
        <AnimatedSection>
          <MobileTabsLayout
            mainContent={mainContentArea}
            relatedSidebar={relatedSidebarContent}
            patternSidebar={patternSidebarContent}
          />
        </AnimatedSection>
      </AnimatedPageWrapper>
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
