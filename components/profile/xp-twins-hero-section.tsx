'use client'

/**
 * XP Twins Hero Section
 *
 * PROMINENT banner showing "87% MATCH WITH YOU!" with detailed similarity breakdown
 * This is the MAIN FEATURE of the profile redesign
 *
 * Only displayed on OTHER users' profiles (not own profile)
 * Only displayed if similarity >= 30%
 *
 * Placement: Between Profile Header and Stats Grid
 *
 * Sections:
 * 1. Match Banner - Large header with match percentage
 * 2. Shared XP DNA - Top 3 shared categories with percentages
 * 3. Shared Experiences - Up to 3 experiences both users witnessed
 * 4. More XP Twins Preview - 3-5 similar users with match % + categories
 */

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2, Target, Sparkles, Users, Eye, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCategoryEmoji } from '@/lib/utils/category-emojis'

interface XPTwinsHeroSectionProps {
  /**
   * The user whose profile is being viewed
   */
  profileUserId: string

  /**
   * The current authenticated user ID
   */
  currentUserId: string

  /**
   * Minimum similarity to show (default: 0.3 = 30%)
   */
  minSimilarity?: number
}

interface SharedCategory {
  category: string
  your_percentage: number
  their_percentage: number
  is_top_for_both: boolean
}

interface SharedExperience {
  id: string
  title: string
  category: string
  witness_count: number
  created_at: string
}

interface MoreTwin {
  user_id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  match_percentage: number
  top_categories: string[]
  similarity_score: number
}

interface XPTwinsData {
  match_percentage: number
  similarity_score: number
  shared_dna: SharedCategory[]
  shared_experiences: SharedExperience[]
  more_twins: MoreTwin[]
  metadata: {
    profile_user_id: string
    current_user_id: string
    calculated_at: string
  }
}

export function XPTwinsHeroSection({
  profileUserId,
  currentUserId,
  minSimilarity = 0.3
}: XPTwinsHeroSectionProps) {
  const [data, setData] = useState<XPTwinsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState<string>('')

  useEffect(() => {
    // Don't show on own profile
    if (currentUserId === profileUserId) {
      setLoading(false)
      return
    }

    async function fetchXPTwinsData() {
      try {
        setLoadingMessage('Calculating XP similarity with this user...')

        const response = await fetch(
          `/api/users/${profileUserId}/xp-twins?currentUserId=${currentUserId}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch XP Twins data')
        }

        const result = await response.json()

        // Only show if similarity >= minimum threshold
        if (result.similarity_score < minSimilarity) {
          setData(null)
          setLoading(false)
          setLoadingMessage('')
          return
        }

        setData(result)
        setLoadingMessage(`${result.match_percentage}% match found! Loading XP Twins data...`)

        // Clear message after data loads
        setTimeout(() => setLoadingMessage(''), 500)
      } catch (err: any) {
        console.error('Error fetching XP Twins data:', err)
        setError(err.message)
        setLoadingMessage('Failed to load XP Twins data')
      } finally {
        setLoading(false)
      }
    }

    fetchXPTwinsData()
  }, [profileUserId, currentUserId, minSimilarity])

  // Don't render on own profile
  if (currentUserId === profileUserId) {
    return null
  }

  // Loading state
  if (loading) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/20">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Calculating XP similarity...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state or no data
  if (error || !data || data.match_percentage < minSimilarity * 100) {
    return null // Silently hide if error or below threshold
  }

  const getMatchQuality = (percentage: number) => {
    if (percentage >= 80) return { label: 'EXCELLENT', color: 'text-green-600 bg-green-50' }
    if (percentage >= 60) return { label: 'VERY GOOD', color: 'text-blue-600 bg-blue-50' }
    if (percentage >= 40) return { label: 'GOOD', color: 'text-purple-600 bg-purple-50' }
    return { label: 'FAIR', color: 'text-amber-600 bg-amber-50' }
  }

  const matchQuality = getMatchQuality(data.match_percentage)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* ARIA Live Region for Screen Readers */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {loadingMessage}
        </div>

        <Card
          className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-primary/5 to-purple-500/5"
          role="region"
          aria-labelledby="xp-twins-title"
          aria-describedby="xp-twins-description"
        >
          {/* 1. MATCH BANNER */}
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex items-center justify-center gap-3 mb-2"
            >
              <Target className="h-8 w-8 text-primary" aria-hidden="true" />
              <CardTitle
                id="xp-twins-title"
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
              >
                <span aria-label={`${data.match_percentage} percent match with this user`}>
                  {data.match_percentage}% MATCH WITH YOU!
                </span>
              </CardTitle>
              <Sparkles className="h-8 w-8 text-purple-600" aria-hidden="true" />
            </motion.div>
            <Badge
              variant="outline"
              className={`${matchQuality.color} font-semibold px-4 py-1`}
              id="xp-twins-description"
            >
              {matchQuality.label} COMPATIBILITY
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 2. SHARED XP DNA */}
            {data.shared_dna.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="space-y-3" role="region" aria-labelledby="shared-dna-title">
                  <h3 id="shared-dna-title" className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" aria-hidden="true" />
                    Shared XP DNA
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {data.shared_dna.map((cat, idx) => (
                      <motion.div
                        key={cat.category}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                      >
                        <Card className={cat.is_top_for_both ? 'border-2 border-primary' : ''}>
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-2xl">{getCategoryEmoji(cat.category)}</span>
                              {cat.is_top_for_both && (
                                <Badge variant="default" className="text-xs">
                                  Top for both!
                                </Badge>
                              )}
                            </div>
                            <p className="font-semibold">{cat.category}</p>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>You: {cat.your_percentage}%</p>
                              <p>Them: {cat.their_percentage}%</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. SHARED EXPERIENCES */}
            {data.shared_experiences.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="space-y-3" role="region" aria-labelledby="shared-experiences-title">
                  <h3 id="shared-experiences-title" className="text-lg font-semibold flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" aria-hidden="true" />
                    Shared Experiences
                  </h3>
                  <div className="space-y-2">
                    {data.shared_experiences.map((exp, idx) => (
                      <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                      >
                        <Link href={`/experiences/${exp.id}`}>
                          <Card className="hover:bg-accent transition-colors cursor-pointer">
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{getCategoryEmoji(exp.category)}</span>
                                <div>
                                  <p className="font-medium">{exp.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {exp.witness_count} users witnessed this
                                  </p>
                                </div>
                              </div>
                              <Badge variant="secondary">{exp.category}</Badge>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. MORE XP TWINS PREVIEW */}
            {data.more_twins.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="space-y-3" role="region" aria-labelledby="more-twins-title">
                  <h3 id="more-twins-title" className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" aria-hidden="true" />
                    More XP Twins
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.more_twins.slice(0, 3).map((twin, idx) => (
                      <motion.div
                        key={twin.user_id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + idx * 0.1 }}
                      >
                        <Link href={`/profile/${twin.username}`}>
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={twin.avatar_url || undefined} />
                                  <AvatarFallback>
                                    {twin.username?.[0]?.toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold truncate">
                                    {twin.display_name || twin.username}
                                  </p>
                                  <Badge variant="secondary" className="text-xs">
                                    {twin.match_percentage}% Match
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {twin.top_categories.map(cat => (
                                  <Badge key={cat} variant="outline" className="text-xs">
                                    {getCategoryEmoji(cat)} {cat}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* View All CTA */}
                  <div className="text-center pt-2">
                    <Link href={`/profile/${profileUserId}?tab=connections`}>
                      <Button
                        variant="outline"
                        className="group"
                        aria-label="View all similar users on the connections tab"
                      >
                        View All Similar Users
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
