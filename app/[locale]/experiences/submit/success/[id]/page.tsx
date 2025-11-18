import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Eye, Share2, PlusCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CategoryHero } from '@/components/success-reveal/CategoryHero'
import { DiscoveryPanel } from '@/components/success-reveal/DiscoveryPanel'
import { PatternRevealSection } from '@/components/success-reveal/PatternRevealSection'
import { ContributionStats } from '@/components/success-reveal/ContributionStats'
import { ConnectedExperiencesGrid } from '@/components/success-reveal/ConnectedExperiencesGrid'
import { RewardsCompact } from '@/components/success-reveal/RewardsCompact'
import { calculateContribution, getCategoryContextMessage } from '@/lib/utils/contribution-calculator'

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function SuccessRevealPage({ params }: PageProps) {
  const { id, locale } = await params
  const supabase = await createClient()

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
    similarData?.map((exp: any) => ({
      id: exp.id,
      title: exp.title,
      summary: exp.summary,
      category: exp.category,
      date: exp.date_occurred || exp.created_at || new Date().toISOString(), // Fallback to now
      location: exp.location_text
        ? {
            city: exp.location_text.split(',')[0]?.trim(),
            country: exp.location_text.split(',')[1]?.trim(),
          }
        : undefined,
      matchScore: exp.similarity_score || 0.8,
      matchReasons: exp.match_reasons || [],
    })) || []

  // Fetch pattern insights
  const patternsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/patterns/for-experience/${id}`,
    {
      cache: 'no-store',
    }
  )

  let patterns: any[] = []
  if (patternsResponse.ok) {
    const patternsData = await patternsResponse.json()
    patterns = patternsData.patterns || []
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

  // Build pattern data for PatternRevealSection
  const patternData = patterns.map((pattern) => ({
    type: pattern.type as 'wave' | 'temporal' | 'correlation',
    data: pattern,
  }))

  // Category context message
  const contextMessage = getCategoryContextMessage(experience.category, contributionMetrics)

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">

      {/* Main Content */}
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <div className="space-y-12">
          {/* Hero Section */}
          <CategoryHero
            category={experience.category}
            title={`Your ${experience.category.replace(/-/g, ' ')} is now live`}
            subtitle={contextMessage}
          />

          {/* Discovery Panel */}
          <DiscoveryPanel
            category={experience.category}
            attributes={attributes}
            aiConfidence={95} // This could come from AI analysis confidence
            location={
              experience.location_text
                ? {
                    city: experience.location_text.split(',')[0]?.trim(),
                    country: experience.location_text.split(',')[1]?.trim(),
                  }
                : undefined
            }
            dateOccurred={experience.date_occurred || experience.created_at || new Date().toISOString()}
          />

          {/* Pattern Reveal (if patterns exist) */}
          {patternData.length > 0 && (
            <PatternRevealSection
              category={experience.category}
              patterns={patternData}
              similarCount={similarExperiences.length}
            />
          )}

          {/* Contribution Stats */}
          <ContributionStats category={experience.category} metrics={contributionMetrics} />

          {/* Connected Experiences */}
          {similarExperiences.length > 0 && (
            <ConnectedExperiencesGrid
              category={experience.category}
              experiences={similarExperiences}
              maxDisplay={3}
            />
          )}

          {/* Rewards */}
          <RewardsCompact
            category={experience.category}
            xpEarned={100} // This should come from publish result
            badgesEarned={[]} // This should come from publish result
            leveledUp={false} // This should come from publish result
            currentLevel={currentLevel}
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
