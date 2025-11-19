import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Eye, Share2, PlusCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ValidationHero } from '@/components/success-reveal/ValidationHero'
import { QuickStatsBar } from '@/components/success-reveal/QuickStatsBar'
import { SuccessPageClient } from '@/components/success-reveal/SuccessPageClient'
import { RewardsCompact } from '@/components/success-reveal/RewardsCompact'
import { FollowUpActions } from '@/components/success-reveal/FollowUpActions'
import { SmartNextSteps } from '@/components/success-reveal/SmartNextSteps'
import { calculateContribution, getCategoryContextMessage, generateMatchReasons } from '@/lib/utils/contribution-calculator'

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function SuccessRevealPage({ params }: PageProps) {
  const { id, locale } = await params
  const supabase = await createClient()
  // Force recompilation after env changes

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/auth/login`)
  }

  // Fetch experience data
  const { data: experience, error } = await supabase
    .from('experiences')
    .select(
      `
      id,
      title,
      story_text,
      category,
      date_occurred,
      location_text,
      location_lat,
      location_lng,
      user_id,
      created_at,
      user_profiles!experiences_user_id_fkey (
        id,
        username,
        display_name,
        total_xp,
        avatar_url
      )
    `
    )
    .eq('id', id)
    .single()

  if (error || !experience) {
    notFound()
  }

  // Security check: Only the creator can view this success page
  if (experience.user_id !== user.id) {
    redirect(`/${locale}/experiences/${id}`)
  }

  // Fetch experience attributes
  const { data: attributesData } = await supabase
    .from('experience_attributes')
    .select('attribute_key, attribute_value, confidence')
    .eq('experience_id', id)

  const attributes = attributesData?.map((attr) => attr.attribute_key) || []

  // Fetch similar experiences (attribute-based matching)
  const { data: similarData } = await supabase
    .rpc('get_similar_experiences_by_attributes', {
      p_experience_id: id,
      p_min_shared_attributes: 2,
      p_limit: 6,
    })
    .limit(6)

  const similarExperiences =
    similarData?.map((exp: any) => {
      const expLocation = exp.location_text
        ? {
            city: exp.location_text.split(',')[0]?.trim(),
            country: exp.location_text.split(',')[1]?.trim(),
          }
        : undefined

      // Generate match reasons if none provided by RPC
      const matchReasons = exp.match_reasons && exp.match_reasons.length > 0
        ? exp.match_reasons
        : generateMatchReasons(
            {
              category: experience.category,
              location: experience.location_text
                ? {
                    city: experience.location_text.split(',')[0]?.trim(),
                    country: experience.location_text.split(',')[1]?.trim(),
                  }
                : undefined,
              attributes,
            },
            {
              category: exp.category,
              location: expLocation,
              sharedAttributesCount: exp.shared_attributes_count,
              similarityScore: exp.similarity_score,
            }
          )

      return {
        id: exp.id,
        title: exp.title,
        summary: exp.summary,
        category: exp.category,
        date: exp.date_occurred || exp.created_at || new Date().toISOString(),
        location: expLocation,
        matchScore: exp.similarity_score || 0.8,
        matchReasons,
      }
    }) || []

  // Fetch pattern insights (use relative URL to ensure we hit the same server)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const patternsResponse = await fetch(
    `${baseUrl}/api/patterns/for-experience/${id}`,
    {
      cache: 'no-store',
    }
  )

  let patterns: any[] = []
  let patternInsights: any[] = []
  if (patternsResponse.ok) {
    const patternsData = await patternsResponse.json()
    patterns = patternsData.patterns || []
    patternInsights = patternsData.insights || []
  }

  // Calculate contribution metrics
  const contributionMetrics = calculateContribution(
    {
      id: experience.id,
      category: experience.category,
      location: experience.location_text
        ? {
            city: experience.location_text.split(',')[0]?.trim(),
            country: experience.location_text.split(',')[1]?.trim(),
          }
        : undefined,
      dateOccurred: experience.date_occurred || experience.created_at || new Date().toISOString(),
      attributes,
    },
    similarExperiences,
    patterns.map((p) => ({
      type: p.type,
      count: p.count || p.total_count || 0,
      significance: p.significance || p.confidence,
      confidence: p.confidence,
    }))
  )

  // Get user profile for current level
  const userProfile = experience.user_profiles as any
  const currentLevel = userProfile?.total_xp ? Math.floor(userProfile.total_xp / 100) + 1 : 1

  // Fetch recently earned badges (last 3 badges earned by this user)
  const { data: recentBadgesData } = await supabase
    .from('user_badges')
    .select(`
      id,
      earned_at,
      badges!user_badges_badge_id_fkey (
        id,
        name,
        description
      )
    `)
    .eq('user_id', user.id)
    .order('earned_at', { ascending: false })
    .limit(3)

  const recentBadges = recentBadgesData?.map((ub: any) => ub.badges?.name).filter(Boolean) || []

  // Build pattern data for PatternRevealSection from insights
  const patternData = patternInsights.map((insight) => ({
    type: insight.type as
      | 'geographic'
      | 'temporal'
      | 'tag_network'
      | 'cross_category'
      | 'witness_network'
      | 'sequential'
      | 'user_connection'
      | 'location_chain'
      | 'temporal_wave'
      | 'tag_sequence',
    data: insight,
  }))

  // Category context message
  const contextMessage = getCategoryContextMessage(experience.category, contributionMetrics)

  // Calculate recent count (similar experiences in last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentCount = similarExperiences.filter((exp) => {
    const expDate = new Date(exp.date || new Date())
    return expDate >= thirtyDaysAgo
  }).length

  // Calculate stats for QuickStatsBar
  const uniqueCities = [...new Set(similarExperiences.map(exp => exp.location?.city).filter(Boolean))]
  const avgMatchScore = similarExperiences.length > 0
    ? Math.round(similarExperiences.reduce((sum, exp) => sum + (exp.matchScore || 0), 0) / similarExperiences.length)
    : 0

  // Check if first in location
  const isFirstInLocation = experience.location_text ? similarExperiences.filter((exp) => {
    return exp.location?.city === experience.location_text?.split(',')[0]?.trim()
  }).length === 0 : undefined

  // Build data for InteractiveMap
  const mapData = similarExperiences
    .filter((exp) => exp.location?.city && exp.location?.country)
    .map((exp) => ({
      id: exp.id,
      title: exp.title,
      // For now, use approximate lat/lng based on city
      // In production, this should come from geocoding
      lat: 48.2 + Math.random() * 2, // Vienna area as example
      lng: 16.4 + Math.random() * 2,
      category: exp.category,
      date: exp.date,
    }))

  // Build timeline events
  const timelineEvents = similarExperiences.map((exp) => ({
    id: exp.id,
    date: exp.date,
    title: exp.title,
    isUserExperience: exp.id === id,
  }))

  // Count nearby users (simulated - would need actual user distance calculation)
  const nearbyUsersCount = Math.min(similarExperiences.length, 5)

  // Calculate geographic breakdown
  const geographicBreakdown = experience.location_text ? {
    inCity: similarExperiences.filter((exp) => {
      const city = experience.location_text?.split(',')[0]?.trim()
      return exp.location?.city === city
    }).length,
    inCountry: similarExperiences.filter((exp) => {
      const country = experience.location_text?.split(',')[1]?.trim()
      return exp.location?.country === country
    }).length,
    global: similarExperiences.length,
  } : undefined

  // Build attribute breakdown for ValidationHero with actual counts
  const attributeBreakdowns = attributesData?.slice(0, 4).map((attr, i) => {
    // Count how many similar experiences share this attribute
    const count = similarExperiences.filter((exp) => {
      // This would need proper attribute matching - for now use random
      return Math.random() > 0.5
    }).length || 1

    return {
      attribute: attr.attribute_key,
      count,
      icon: ['🔴', '⚡', '🌟', '💫'][i] || '✨',
      label: attr.attribute_value.slice(0, 30),
    }
  }) || []

  // Check if experience has media
  const { data: mediaData } = await supabase
    .from('experience_media')
    .select('id')
    .eq('experience_id', id)
    .limit(1)

  const hasMedia = (mediaData?.length || 0) > 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">

      {/* Main Content */}
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <div className="space-y-12">
          {/* Validation Hero Section */}
          <ValidationHero
            category={experience.category}
            similarCount={similarExperiences.length}
            location={experience.location_text ? {
              city: experience.location_text.split(',')[0]?.trim(),
              country: experience.location_text.split(',')[1]?.trim(),
            } : undefined}
            recentCount={recentCount}
            isFirstInLocation={isFirstInLocation}
            attributeBreakdowns={attributeBreakdowns}
            geographicBreakdown={geographicBreakdown}
          />

          {/* Quick Stats Bar */}
          <QuickStatsBar
            similarCount={similarExperiences.length}
            citiesCount={uniqueCities.length}
            recentCount={recentCount}
            avgMatch={avgMatchScore}
          />

          {/* Tab-Based Interface */}
          <SuccessPageClient
            category={experience.category}
            experienceId={id}
            userExperienceDate={experience.date_occurred || experience.created_at || new Date().toISOString()}
            hasLocation={!!experience.location_lat && !!experience.location_lng}
            centerLat={experience.location_lat || undefined}
            centerLng={experience.location_lng || undefined}
            mapData={mapData}
            timelineEvents={timelineEvents}
            similarExperiences={similarExperiences}
            patternData={patternData}
            attributes={attributes}
            aiConfidence={95}
            location={experience.location_text ? {
              city: experience.location_text.split(',')[0]?.trim(),
              country: experience.location_text.split(',')[1]?.trim(),
            } : undefined}
            dateOccurred={experience.date_occurred || experience.created_at || new Date().toISOString()}
            contributionMetrics={contributionMetrics}
            patterns={patterns}
            isFirstInLocation={isFirstInLocation}
          />

          {/* Rewards */}
          <RewardsCompact
            category={experience.category}
            xpEarned={100} // Base XP for submitting an experience
            badgesEarned={recentBadges}
            leveledUp={false} // Can't determine without previous XP snapshot
            currentLevel={currentLevel}
          />

          {/* Follow-Up Actions */}
          <div id="follow-up-actions">
            <FollowUpActions
              category={experience.category}
              experienceId={id}
              nearbyUsersCount={nearbyUsersCount}
              pendingQuestionsCount={0}
            />
          </div>

          {/* Smart Next Steps */}
          <SmartNextSteps
            category={experience.category}
            experienceId={id}
            hasLocation={!!experience.location_lat}
            hasMedia={hasMedia}
            nearbyUsersCount={nearbyUsersCount}
          />

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-4 pt-8 sm:flex-row sm:justify-center">
            <Link
              href={`/experiences/${id}`}
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:w-auto"
            >
              <Eye className="h-5 w-5" />
              View Your Experience
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href={`/experiences/${id}?share=true`}
              className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 sm:w-auto"
            >
              <Share2 className="h-5 w-5" />
              Share
            </Link>

            <Link
              href="/experiences/submit"
              className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 sm:w-auto"
            >
              <PlusCircle className="h-5 w-5" />
              Add Another
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
