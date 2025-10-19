'use client'

/**
 * Similarity Details Modal Component
 *
 * Shows detailed breakdown of similarity match between two users
 * Displays:
 * - Similarity percentage with match quality badge
 * - Shared categories grid
 * - Shared experiences list (top 5)
 * - Connect button
 * - Link to view all similar users
 */

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Sparkles, Users, FileText, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getCategoryColor, getCategoryEmoji } from '@/lib/constants/categories'
import { motion } from 'framer-motion'
import { SimilarityModalSkeleton } from './similarity-modal-skeleton'

interface SimilarityDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  similarity: {
    similar_user_id: string
    similarity_score: number
    shared_categories: string[]
    shared_category_count: number
    same_location: boolean
  }
  profileUserId: string
  currentUserId: string
}

interface SharedExperience {
  id: string
  title: string
  category: string
  created_at: string
}

const QUALITY_COLORS = {
  EXCELLENT: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
  VERY_GOOD: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white',
  GOOD: 'bg-gradient-to-r from-green-600 to-teal-600 text-white',
  FAIR: 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white',
}

function getMatchQuality(score: number): 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'FAIR' {
  if (score >= 0.8) return 'EXCELLENT'
  if (score >= 0.7) return 'VERY_GOOD'
  if (score >= 0.5) return 'GOOD'
  return 'FAIR'
}

export function SimilarityDetailsModal({
  open,
  onOpenChange,
  similarity,
  profileUserId,
  currentUserId,
}: SimilarityDetailsModalProps) {
  const [sharedExperiences, setSharedExperiences] = useState<SharedExperience[]>([])
  const [loadingExperiences, setLoadingExperiences] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [connectionSent, setConnectionSent] = useState(false)

  const percentage = Math.round(similarity.similarity_score * 100)
  const matchQuality = getMatchQuality(similarity.similarity_score)

  useEffect(() => {
    if (!open) {
      setHasAnimated(false)
      setConnectionSent(false) // Reset connection state on close
      return
    }

    // Trigger animation
    setHasAnimated(true)

    async function fetchSharedExperiences() {
      setLoadingExperiences(true)
      try {
        const response = await fetch(
          `/api/experiences/shared?user1=${currentUserId}&user2=${profileUserId}&limit=5`
        )

        if (response.ok) {
          const data = await response.json()
          setSharedExperiences(data.experiences || [])
        }
      } catch (error) {
        console.error('Error fetching shared experiences:', error)
      } finally {
        setLoadingExperiences(false)
      }
    }

    fetchSharedExperiences()
  }, [open, currentUserId, profileUserId])

  const handleConnect = async () => {
    // Optimistic UI: Show success immediately
    setConnectionSent(true)
    setIsConnecting(true)

    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addressee_id: profileUserId,
          message: `Hey! We have a ${percentage}% XP Twin match. Let's connect!`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Revert optimistic update on error
        setConnectionSent(false)
        console.error('Failed to create connection:', data.error)
        alert(data.error || 'Failed to create connection')
        return
      }

      // Success! Keep the optimistic state
      setTimeout(() => {
        alert('Connection request sent successfully!')
        onOpenChange(false)
      }, 500) // Small delay to show the success animation
    } catch (err) {
      // Revert optimistic update on error
      setConnectionSent(false)
      console.error('Error creating connection:', err)
      alert('Failed to send connection request')
    } finally {
      setIsConnecting(false)
    }
  }

  // Show skeleton while loading experiences on first open
  if (loadingExperiences && sharedExperiences.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              XP Twin Match Details
            </DialogTitle>
            <DialogDescription className="text-sm">
              Loading similarity details...
            </DialogDescription>
          </DialogHeader>
          <SimilarityModalSkeleton />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              XP Twin Match Details
            </DialogTitle>
            <DialogDescription className="text-sm">
              You share similar experiences and interests with this user
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* Similarity Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                  <div>
                    <motion.h3
                      className="text-2xl sm:text-3xl font-bold text-primary"
                      initial={{ scale: 0 }}
                      animate={{ scale: hasAnimated ? 1 : 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 15,
                        delay: 0.2,
                      }}
                    >
                      {percentage}%
                    </motion.h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Similarity Score</p>
                  </div>
                  <Badge className={QUALITY_COLORS[matchQuality]}>
                    {matchQuality.replace('_', ' ')}
                  </Badge>
                </div>
                <Progress
                  value={percentage}
                  className="h-2 sm:h-3 [&>div]:bg-gradient-to-r [&>div]:from-purple-600 [&>div]:to-blue-600"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Shared Categories */}
          {similarity.shared_categories && similarity.shared_categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Shared Categories ({similarity.shared_categories.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {similarity.shared_categories.map((category, index) => {
                      const emoji = getCategoryEmoji(category)
                      const color = getCategoryColor(category)
                      const label = category
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())

                      return (
                        <motion.div
                          key={category}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, delay: 0.4 + index * 0.05 }}
                        >
                          <Badge
                            variant="secondary"
                            className="gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 text-xs"
                            style={{
                              borderLeft: `3px solid ${color}`,
                            }}
                          >
                            <span className="text-sm">{emoji}</span>
                            <span className="hidden sm:inline">{label}</span>
                            <span className="sm:hidden">{label.split(' ')[0]}</span>
                          </Badge>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Shared Experiences */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Shared Experiences
                </h3>

                {loadingExperiences ? (
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : sharedExperiences.length > 0 ? (
                  <div className="space-y-2">
                    {sharedExperiences.map((exp, index) => (
                      <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      >
                        <Link
                          href={`/experiences/${exp.id}`}
                          className="block p-2.5 sm:p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-sm sm:text-base">{exp.title}</p>
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  <span className="sm:hidden">{getCategoryEmoji(exp.category)}</span>
                                  <span className="hidden sm:inline">{getCategoryEmoji(exp.category)} {exp.category}</span>
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(exp.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground text-center py-3 sm:py-4">
                    No shared experiences found yet
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="flex flex-col gap-2 sm:gap-3"
          >
            <Button
              onClick={handleConnect}
              disabled={isConnecting || connectionSent}
              size="lg"
              className={`w-full text-sm sm:text-base h-10 sm:h-11 transition-all ${
                connectionSent ? 'bg-green-600 hover:bg-green-600' : ''
              }`}
            >
              {connectionSent ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="flex items-center"
                >
                  ✓ Request Sent!
                </motion.span>
              ) : isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Connect as XP Twin</span>
                  <span className="sm:hidden">Connect</span>
                </>
              )}
            </Button>

            {/* currentUserId is UUID - will be redirected by middleware to username */}
            <Link href={`/profile/${currentUserId}?tab=xp-twins`} className="w-full">
              <Button variant="outline" size="lg" className="w-full text-sm sm:text-base h-10 sm:h-11">
                <span className="hidden sm:inline">View All Similar Users →</span>
                <span className="sm:hidden">View All →</span>
              </Button>
            </Link>
          </motion.div>

          {/* Match Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="text-xs text-muted-foreground text-center"
          >
            {percentage >= 80 && '🎯 You share very similar XP profiles!'}
            {percentage >= 60 && percentage < 80 && '✨ Strong overlap in experiences'}
            {percentage >= 40 && percentage < 60 && '🔗 Notable pattern similarities'}
            {percentage < 40 && '💫 Some shared experience patterns'}
          </motion.p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
