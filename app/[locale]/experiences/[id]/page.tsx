import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ThreeColumnLayout } from '@/components/layout/three-column-layout'
import { ExperienceHeader } from '@/components/experience-detail/ExperienceHeader'
import { ExperienceContent } from '@/components/experience-detail/ExperienceContent'
import { RelatedSidebar } from '@/components/experience-detail/RelatedSidebar'
import { PatternSidebar } from '@/components/experience-detail/PatternSidebar'
import { MobileTabsLayout } from '@/components/experience-detail/MobileTabsLayout'
import { CommentsSection } from '@/components/interactions/comments-section'
import { CrossCategoryInsights } from '@/components/experience-detail/CrossCategoryInsights'
import { MapboxMiniMap } from '@/components/experience-detail/MapboxMiniMap'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getSimilarExperiences,
  getEnvironmentalData,
  getCrossCategoryInsights,
} from '@/lib/api/experiences'
import { getImageBlurDataURL } from '@/lib/utils/image-blur'

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

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const supabase = await createClient()
  const { id } = await params

  const { data: experience } = await supabase
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
    .single()

  if (!experience) {
    return {
      title: 'Experience Not Found',
    }
  }

  const profile = experience.user_profiles as any
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

  // Fetch similar experiences using vector similarity
  const similarExperiences = await getSimilarExperiences(id, 12)

  // Fetch external events (Solar, Moon, Weather)
  const externalEvents = await getEnvironmentalData(
    experience.date_occurred,
    experience.location_lat ?? undefined,
    experience.location_lng ?? undefined
  )

  // Fetch cross-category insights (Aha-Moment #9)
  const crossCategoryInsights = await getCrossCategoryInsights(experience.category)

  // Fetch dynamic Q&A answers
  const { data: dynamicAnswers } = await supabase
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

  // Fetch media
  const { data: mediaItems } = await supabase
    .from('experience_media')
    .select('*')
    .eq('experience_id', id)
    .order('sort_order', { ascending: true })

  // Get hero image (first image) for blur placeholder
  const heroImage = mediaItems?.find((item: any) => item.type === 'image')
  let heroImageBlur = ''
  if (heroImage?.url) {
    try {
      heroImageBlur = await getImageBlurDataURL(heroImage.url)
    } catch (error) {
      console.error('Failed to generate blur placeholder:', error)
    }
  }

  // Fetch witnesses
  const { data: witnesses } = await supabase
    .from('experience_witnesses')
    .select('*')
    .eq('experience_id', id)

  // Fetch linked experiences
  const { data: linkedExps } = await supabase
    .from('experience_links')
    .select(`
      linked_experience_id,
      experiences!experience_links_linked_experience_id_fkey (
        id,
        title,
        category,
        user_profiles (
          username,
          display_name
        )
      )
    `)
    .eq('source_experience_id', id)

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

  // Prepare similar experiences data (now with real similarity scores)
  const similarExpsData = similarExperiences || []

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
      <div className="space-y-6">
        <PatternSidebar
          experienceId={experience.id}
          category={experience.category}
          dateOccurred={experience.date_occurred ?? undefined}
          locationLat={experience.location_lat ?? undefined}
          locationLng={experience.location_lng ?? undefined}
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
            nearbyCount={0}
          />
        )}
      </div>
    </Suspense>
  )

  // Transform data for ExperienceContent
  const formattedDynamicAnswers = (dynamicAnswers || []).map((answer: any) => ({
    question_id: answer.dynamic_questions.id,
    question_text: answer.dynamic_questions.question_text,
    answer_type: answer.dynamic_questions.question_type as 'text' | 'chips' | 'slider',
    answer_value: answer.answer_value,
    options: answer.dynamic_questions.options,
  }))

  const formattedMedia = (mediaItems || [])
    .filter((item: any) => item.type === 'image')
    .map((item: any) => ({
      id: item.id,
      url: item.url,
      type: 'image' as const,
      caption: item.caption,
    }))

  const formattedSketches = (mediaItems || [])
    .filter((item: any) => item.type === 'sketch')
    .map((item: any) => item.url)

  const formattedWitnesses = (witnesses || []).map((w: any) => ({
    id: w.id,
    name: w.name,
    is_verified: w.is_verified,
    testimony: w.testimony,
  }))

  const formattedLinkedExperiences = (linkedExps || []).map((link: any) => ({
    id: link.experiences.id,
    title: link.experiences.title,
    category: link.experiences.category,
    user_profiles: link.experiences.user_profiles,
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

      {/* Skip to Content Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Sticky Header */}
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
